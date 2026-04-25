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
    'oven', 'toaster', 'refrigerator', 'hair drier', 'clock'
  ]);

  const plastic = new Set(['bottle', 'cup', 'bowl', 'frisbee', 'backpack', 'umbrella', 'handbag', 'suitcase']);
  const metal = new Set(['fork', 'knife', 'spoon', 'sink', 'scissors', 'fire hydrant', 'stop sign', 'parking meter']);
  const glass = new Set(['wine glass', 'vase', 'cup']); // Some cups are glass, some plastic
  
  const compostable = new Set([
    'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog',
    'pizza', 'donut', 'cake', 'potted plant', 'bird', 'cat', 'dog', 'horse', 
    'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'
  ]);

  const paper = new Set(['book', 'tie']); // Ties are often textile but sometimes paper-like/packaging

  const waste = new Set([
    'sports ball', 'kite', 'baseball bat', 'baseball glove',
    'skateboard', 'surfboard', 'tennis racket', 'chair', 'couch', 'bed',
    'dining table', 'toilet', 'teddy bear', 'toothbrush'
  ]);

  const vehicle = new Set(['bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat']);

  if (eWaste.has(cocoName)) return 'e-waste';
  if (plastic.has(cocoName)) return 'plastic';
  if (metal.has(cocoName)) return 'metal';
  if (glass.has(cocoName)) return 'glass';
  if (compostable.has(cocoName)) return 'compostable';
  if (paper.has(cocoName)) return 'paper';
  if (waste.has(cocoName)) return 'waste';
  if (vehicle.has(cocoName)) return 'waste'; // Large waste
  return 'unknown';
}

export function trashClassFor(cocoIndex: number): string {
  const cocoName = COCO_CLASSES[cocoIndex];
  if (!cocoName) return 'unknown';
  return trashClassForName(cocoName);
}
