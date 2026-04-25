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

export interface BBox { x: number; y: number; width: number; height: number }

export function trashClassForName(cocoName: string, bbox?: BBox): string {
  const aspectRatio = bbox ? bbox.height / bbox.width : 1;

  // E-Waste Logic
  const eWaste = new Set([
    'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave',
    'oven', 'toaster', 'refrigerator', 'hair drier', 'clock'
  ]);

  // Plastic & Containers
  const plastic = new Set(['bottle', 'cup', 'bowl', 'frisbee', 'scissors']);
  
  // Textile
  const textile = new Set(['backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'teddy bear']);

  // Metal
  const metal = new Set(['fork', 'knife', 'spoon', 'sink', 'fire hydrant', 'stop sign', 'parking meter']);
  
  // Glass - Heuristic: wine glass is always glass, but cup/bottle depends on shape
  const glass = new Set(['wine glass', 'vase']); 
  
  // Compostable
  const compostable = new Set([
    'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog',
    'pizza', 'donut', 'cake', 'potted plant', 'bird', 'cat', 'dog', 'horse', 
    'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'
  ]);

  // Paper
  const paper = new Set(['book']); 

  // General Waste
  const waste = new Set([
    'sports ball', 'kite', 'baseball bat', 'baseball glove',
    'skateboard', 'surfboard', 'tennis racket', 'chair', 'couch', 'bed',
    'dining table', 'toilet', 'toothbrush'
  ]);

  const vehicle = new Set(['bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat']);

  // --- Heuristic Differentiation (Virtual Fine-Tuning) ---
  
  // Differentiation for 'bottle'
  if (cocoName === 'bottle') {
    // Tall, thin bottles are almost always plastic or glass.
    // If it's extremely tall/thin (like a wine bottle), we lean glass.
    if (aspectRatio > 2.8) return 'glass';
    // If it's very small and wide, it's often a jar or a metal can misdetected.
    if (aspectRatio < 1.2) return 'metal';
    return 'plastic';
  }

  // Differentiation for 'cup'
  if (cocoName === 'cup') {
    // Ceramic cups are often detected as 'cup'. 
    // Heuristic: If it's squat and wide, it's more likely a ceramic mug (waste/landfill).
    if (aspectRatio < 0.9) return 'waste'; 
    return 'plastic';
  }

  // Differentiation for 'bowl'
  if (cocoName === 'bowl') {
    if (aspectRatio < 0.5) return 'plastic'; // shallow disposable bowl
    return 'waste'; // likely ceramic
  }

  if (eWaste.has(cocoName)) return 'e-waste';
  if (plastic.has(cocoName)) return 'plastic';
  if (textile.has(cocoName)) return 'textile';
  if (metal.has(cocoName)) return 'metal';
  if (glass.has(cocoName)) return 'glass';
  if (compostable.has(cocoName)) return 'compostable';
  if (paper.has(cocoName)) return 'paper';
  if (waste.has(cocoName)) return 'waste';
  if (vehicle.has(cocoName)) return 'waste'; 
  
  return 'unknown';
}

export function trashClassFor(cocoIndex: number, bbox?: BBox): string {
  const cocoName = COCO_CLASSES[cocoIndex];
  if (!cocoName) return 'unknown';
  return trashClassForName(cocoName, bbox);
}
