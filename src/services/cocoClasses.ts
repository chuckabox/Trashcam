export const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
  'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
  'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
  'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
  'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
  'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
  'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
  'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
  'toothbrush',
] as const

export function trashClassForName(cocoName: string): string {
  const eWaste = new Set([
    'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave',
    'oven', 'toaster', 'refrigerator', 'hair drier'
  ]);

  const plastic = new Set(['bottle', 'cup', 'bowl', 'frisbee']);
  const metal = new Set(['fork', 'knife', 'spoon', 'sink', 'scissors', 'fire hydrant']);
  const glass = new Set(['wine glass', 'vase']);
  
  const compostable = new Set([
    'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog',
    'pizza', 'donut', 'cake', 'potted plant'
  ]);

  const paper = new Set(['book']);

  const waste = new Set([
    'backpack', 'umbrella', 'tie', 'suitcase',
    'sports ball', 'kite', 'baseball bat', 'baseball glove',
    'tennis racket', 'chair', 'couch', 'bed',
    'dining table', 'toilet', 'clock', 'teddy bear', 'toothbrush'
  ]);

  if (eWaste.has(cocoName)) return 'e-waste';
  if (plastic.has(cocoName)) return 'plastic';
  if (metal.has(cocoName)) return 'metal';
  if (glass.has(cocoName)) return 'glass';
  if (compostable.has(cocoName)) return 'compostable';
  if (paper.has(cocoName)) return 'paper';
  if (waste.has(cocoName)) return 'waste';
  return 'unknown';
}

export function trashClassFor(cocoIndex: number): string {
  const cocoName = COCO_CLASSES[cocoIndex];
  if (!cocoName) return 'unknown';
  return trashClassForName(cocoName);
}
