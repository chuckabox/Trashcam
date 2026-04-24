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

// Index-based mapping (for raw YOLO output)
export const COCO_TO_TRASH: Record<number, string> = {
  39: 'plastic_bottle',
  40: 'glass_bottle',
  41: 'plastic_cup',
  42: 'plastic_utensils',
  43: 'plastic_utensils',
  44: 'plastic_utensils',
  45: 'plastic_container',
  46: 'banana_peel',
  47: 'apple_core',
  48: 'food_waste',
  49: 'food_waste',
  50: 'food_waste',
  51: 'food_waste',
  52: 'food_waste',
  53: 'pizza_box',
  54: 'food_waste',
  55: 'food_waste',
  62: 'laptop',
  63: 'laptop',
  64: 'cable',
  65: 'remote',
  66: 'cable',
  67: 'phone',
  73: 'magazine',
  74: 'battery',
  75: 'glass_jar',
  76: 'plastic_utensils',
  77: 'clothing',
  79: 'plastic_toothbrush',
}

// Name-based mapping for COCO-SSD (returns class name strings)
export const COCO_NAME_TO_TRASH: Record<string, string> = {
  bottle: 'plastic_bottle',
  'wine glass': 'glass_bottle',
  cup: 'plastic_cup',
  fork: 'plastic_utensils',
  knife: 'plastic_utensils',
  spoon: 'plastic_utensils',
  bowl: 'plastic_container',
  banana: 'banana_peel',
  apple: 'apple_core',
  sandwich: 'food_waste',
  orange: 'food_waste',
  broccoli: 'food_waste',
  carrot: 'food_waste',
  'hot dog': 'food_waste',
  pizza: 'pizza_box',
  donut: 'food_waste',
  cake: 'food_waste',
  tv: 'laptop',
  laptop: 'laptop',
  mouse: 'cable',
  remote: 'remote',
  keyboard: 'cable',
  'cell phone': 'phone',
  book: 'magazine',
  clock: 'battery',
  vase: 'glass_jar',
  scissors: 'plastic_utensils',
  'teddy bear': 'clothing',
  'hair drier': 'plastic_utensils',
  toothbrush: 'plastic_toothbrush',
}

export function trashClassFor(cocoIndex: number): string {
  return COCO_TO_TRASH[cocoIndex] ?? 'unknown'
}

export function trashClassForName(cocoName: string): string {
  return COCO_NAME_TO_TRASH[cocoName] ?? 'unknown'
}
