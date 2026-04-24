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
] as const;

// Map COCO class index -> yoloClass string in degradation.json.
// Items not listed fall through to 'unknown'.
export const COCO_TO_TRASH: Record<number, string> = {
  39: 'plastic_bottle',   // bottle
  40: 'glass_bottle',     // wine glass
  41: 'plastic_cup',      // cup
  42: 'plastic_utensils', // fork
  43: 'plastic_utensils', // knife
  44: 'plastic_utensils', // spoon
  45: 'plastic_container',// bowl
  46: 'banana_peel',
  47: 'apple_core',
  48: 'food_waste',       // sandwich
  49: 'food_waste',       // orange
  50: 'food_waste',       // broccoli
  51: 'food_waste',       // carrot
  52: 'food_waste',       // hot dog
  53: 'pizza_box',
  54: 'food_waste',       // donut
  55: 'food_waste',       // cake
  62: 'laptop',           // tv -> treat as electronic
  63: 'laptop',
  64: 'cable',            // mouse (electronic)
  65: 'remote',
  66: 'cable',            // keyboard (electronic)
  67: 'phone',            // cell phone
  73: 'magazine',         // book
  74: 'battery',          // clock (rough; most clocks have batteries)
  75: 'glass_jar',        // vase
  76: 'plastic_utensils', // scissors
  77: 'clothing',         // teddy bear (textile)
  79: 'plastic_toothbrush',
};

export function trashClassFor(cocoIndex: number): string {
  return COCO_TO_TRASH[cocoIndex] ?? 'unknown';
}
