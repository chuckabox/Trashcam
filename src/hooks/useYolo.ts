import { useEffect, useState } from 'react';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useFrameProcessor } from 'react-native-vision-camera';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { Worklets, useSharedValue } from 'react-native-worklets-core';
import type { Detection } from '../types';
import {
  DETECTION_CONFIDENCE_THRESHOLD,
  MODEL_INPUT_SIZE,
  parseYoloOutput,
} from '../services/detection';

const FRAME_SAMPLE_INTERVAL = 5; // run inference every Nth frame

export function useYolo() {
  const model = useTensorflowModel(require('../../assets/models/yolov8n.tflite'));
  const { resize } = useResizePlugin();
  const [detections, setDetections] = useState<Detection[]>([]);
  const [bestConfidence, setBestConfidence] = useState(0);
  const frameCounter = useSharedValue(0);

  const setDetectionsJS = Worklets.createRunOnJS((d: Detection[], best: number) => {
    setDetections(d);
    setBestConfidence(best);
  });

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      frameCounter.value = (frameCounter.value + 1) % FRAME_SAMPLE_INTERVAL;
      if (frameCounter.value !== 0) return;
      if (model.state !== 'loaded') return;

      const resized = resize(frame, {
        scale: { width: MODEL_INPUT_SIZE, height: MODEL_INPUT_SIZE },
        pixelFormat: 'rgb',
        dataType: 'float32',
      });

      // ultralytics TFLite expects 0..1 normalized RGB
      const input = new Float32Array(resized.length);
      for (let i = 0; i < resized.length; i++) {
        input[i] = (resized[i] as number) / 255.0;
      }

      const outputs = model.model!.runSync([input]);
      const raw = outputs[0] as unknown as Float32Array;
      const boxes = parseYoloOutput(raw, DETECTION_CONFIDENCE_THRESHOLD);

      let best = 0;
      for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].confidence > best) best = boxes[i].confidence;
      }
      setDetectionsJS(boxes, best);
    },
    [model, resize],
  );

  useEffect(() => {
    if (model.state === 'error') {
      console.error('YOLO model failed to load:', model.error);
    }
  }, [model.state]);

  return {
    frameProcessor,
    detections,
    bestConfidence,
    modelLoading: model.state !== 'loaded',
    modelError: model.state === 'error' ? model.error : null,
  };
}
