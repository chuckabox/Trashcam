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
  const recyclables = new Set([
    'bottle', 'wine glass', 'cup', 'bowl', 'laptop', 'cell phone', 'tv', 
    'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'car', 'bus', 
    'truck', 'motorcycle', 'bicycle', 'keyboard', 'mouse', 'remote'
  ]);

  const waste = new Set([
    'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 
    'pizza', 'donut', 'cake', 'toothbrush', 'fork', 'knife', 'spoon', 'book', 
    'vase', 'scissors', 'teddy bear', 'hair drier', 'backpack', 'umbrella', 
    'handbag', 'tie', 'suitcase'
  ]);

  if (recyclables.has(cocoName)) return 'recyclable';
  if (waste.has(cocoName)) return 'waste';
  return 'unknown';
}
