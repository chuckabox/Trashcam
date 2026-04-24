# TrashLife

**Point your phone at a piece of trash. Real YOLOv8 tells you what it is. The app tells you how long it takes to decompose and how to dispose of it.**

- **Real-time Object Detection** via TensorFlow.js (COCO-SSD) in the browser.
- **Beautiful UI** using Tailwind CSS + Lucide React.
- **48-item degradation database** (material, decomposition time, CO₂, water, toxicity, disposal tip).
- **Local-first** waste diary + dashboard (localStorage).

---

## Table of Contents

1. [What You'll See](#what-youll-see)
2. [Project Structure](#project-structure)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started) ← **READ THIS**
5. [Troubleshooting](#troubleshooting)
6. [Roadmap](#roadmap)
7. [Mobile Version (Native)](#mobile-version-native)

---

## What You'll See

1. Launch app → camera opens, model loads (~1 sec on first run).
2. Point at a water bottle / can / banana / laptop — bounding boxes appear in real time with class + confidence.
3. Confidence ≥ 60% → snap button glows green.
4. Tap it → capture, save, navigate to results.
5. Results card shows: photo, material, decomposition time, CO₂/water/toxicity, disposal tip.
6. Diary + Dashboard aggregate all your scans.

**The live detector uses YOLOv8n pretrained on COCO** (80 classes). Out of the box it works great on `bottle`, `cup`, `banana`, `apple`, `pizza`, `cell phone`, `laptop`, `book`, `toothbrush`, etc. — items that overlap with the trash database. For full trash-specific detection (styrofoam, aluminum cans, cigarette butts, diapers, batteries…) you fine-tune on a trash dataset — see [Training Your Own Trash Model](#training-your-own-trash-model).

---

## Architecture

```
┌─────────────────────────────┐
│ ScannerScreen               │
│ vision-camera <Camera> view │
└────────────┬────────────────┘
             │ every Nth frame (worklet)
             ▼
┌─────────────────────────────────────────┐
│ useYolo hook                            │
│  1. resize frame → 640×640 float32 RGB  │ (vision-camera-resize-plugin)
│  2. model.runSync([input])              │ (react-native-fast-tflite)
│  3. parseYoloOutput() → NMS             │ (worklet-safe, no sort closures)
│  4. Worklets.createRunOnJS → React state│
└────────────┬────────────────────────────┘
             │ Detection[] on JS thread
             ▼
      BoundingBoxOverlay       SnapButton (glows if conf ≥ 0.6)
                                    │ tap
                                    ▼
                           camera.takePhoto()
                                    │
                                    ▼
                            useOcr (stub)
                                    │
                                    ▼
                    lookup(COCO→trash class) → DegradationInfo
                                    │
                                    ▼
                         saveScan → AsyncStorage
                                    │
                                    ▼
                            navigate('Results')
```

---

## Project Structure

```
```
trashlife/
├── src/
│   ├── main.tsx             # Vite entry point
│   ├── App.tsx              # Web router & layout
│   ├── index.css            # Tailwind + Global styles
│   ├── components/          # UI components (Scanner, Results, etc.)
│   ├── hooks/               # useYolo (TF.js detection), useScan
│   ├── services/            # ML processing & logic
│   ├── data/                # Degradation database (JSON)
│   └── types/               # TypeScript definitions
├── public/                  # Static assets
├── package.json             # Web dependencies & scripts
├── tailwind.config.js       # Tailwind configuration
└── vite.config.ts           # Vite configuration
```

---

## Tech Stack

| Layer | Package |
|---|---|
| Runtime | React 18 |
| Build Tool | Vite 5 |
| ML Runtime | TensorFlow.js + COCO-SSD |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Navigation | React Router Dom |
| Charts | Recharts |

---

### Prerequisites

- **Node 18+**
- **npm** (or yarn/pnpm)

### Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

### Deployment

This project is configured for deployment on **Render** (see `render.yaml`).
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Fallback**: Rewrites all routes to `index.html` for SPA support.

---

## Mobile Version (Native)

The root of this repository contains legacy code for a React Native (Expo) version of TrashLife using YOLOv8n on-device.

To run the mobile version, you would need to:
1. Re-add native dependencies to `package.json` (`react-native`, `expo`, `react-native-vision-camera`, etc.).
2. Use `npx expo run:android` or `npx expo run:ios`.

For details on the native YOLO implementation, see the sections below (Legacy Documentation).

---

## How Real YOLO Is Wired (Legacy)

The key file is [src/hooks/useYolo.ts](src/hooks/useYolo.ts):

```ts
const model = useTensorflowModel(require('../../assets/models/yolov8n.tflite'));
const { resize } = useResizePlugin();

const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  // Throttle: 1 inference per 5 frames (~6 FPS at 30 FPS camera)
  frameCounter.value = (frameCounter.value + 1) % 5;
  if (frameCounter.value !== 0) return;
  if (model.state !== 'loaded') return;

  // Resize 1920×1080 camera frame → 640×640 float32 RGB
  const resized = resize(frame, {
    scale: { width: 640, height: 640 },
    pixelFormat: 'rgb',
    dataType: 'float32',
  });

  // Normalize 0..255 → 0..1
  const input = new Float32Array(resized.length);
  for (let i = 0; i < resized.length; i++) input[i] = resized[i] / 255.0;

  // Run inference
  const [output] = model.model!.runSync([input]);

  // Parse + NMS (worklet-safe, all primitive JS)
  const boxes = parseYoloOutput(output as Float32Array, 0.4);

  // Ship results to JS thread for React state update
  setDetectionsJS(boxes, bestConfidence);
}, [model, resize]);
```

The YOLO output is `[1, 84, 8400]` (4 bbox coords + 80 class scores × 8400 anchors). The parser in [src/services/detection.ts](src/services/detection.ts) auto-detects layout (some exports transpose to `[1, 8400, 84]`), finds the best class per anchor, applies a confidence threshold, then runs IoU-based NMS.

**Thresholds** (tune in `detection.ts`):

- `DETECTION_CONFIDENCE_THRESHOLD = 0.4` — boxes below this are dropped.
- `SNAP_CONFIDENCE_THRESHOLD = 0.6` — snap button glows green.
- `NMS_IOU_THRESHOLD = 0.45` — overlapping duplicate boxes are merged.

---

## COCO → Trash Class Mapping

The bundled YOLOv8n is trained on **COCO** (80 classes — persons, cars, household items, etc.). Many COCO classes map cleanly to trash classes in our degradation DB:

| COCO ID | COCO name | → trash class |
|---|---|---|
| 39 | bottle | plastic_bottle |
| 40 | wine glass | glass_bottle |
| 41 | cup | plastic_cup |
| 42–44 | fork / knife / spoon | plastic_utensils |
| 45 | bowl | plastic_container |
| 46 | banana | banana_peel |
| 47 | apple | apple_core |
| 48–55 | sandwich / orange / broccoli / carrot / hot dog / pizza / donut / cake | food_waste / pizza_box |
| 63 | laptop | laptop |
| 65 | remote | remote |
| 67 | cell phone | phone |
| 73 | book | magazine |
| 79 | toothbrush | plastic_toothbrush |

Everything else falls through to the `unknown` entry (which the UI filters out of snaps). Full map in [src/services/cocoClasses.ts](src/services/cocoClasses.ts).

---

## Training Your Own Trash Model

COCO doesn't know what "styrofoam", "aluminum can", "cigarette butt", "diaper", or "battery" is. For full trash coverage, fine-tune YOLOv8n on a trash dataset:

### 1. Install Ultralytics (Python)

```bash
pip install ultralytics
```

### 2. Pick a dataset

- **[TACO](http://tacodataset.org/)** — 60 classes of litter in the wild, ~1,500 images
- **[TrashNet](https://github.com/garythung/trashnet)** — 6 material classes, ~2,500 images
- **[Roboflow Universe - Garbage](https://universe.roboflow.com/search?q=garbage)** — many trash datasets, auto-exports YOLO format

### 3. Fine-tune

```bash
yolo train \
    model=assets/models/yolov8n.pt \
    data=path/to/trash-dataset/data.yaml \
    epochs=50 \
    imgsz=640
```

### 4. Export to TFLite

```bash
yolo export model=runs/detect/train/weights/best.pt format=tflite
```

### 5. Swap in

- Replace `assets/models/yolov8n.tflite` with `best_float32.tflite`.
- Update [src/services/cocoClasses.ts](src/services/cocoClasses.ts):
  - Replace `COCO_CLASSES` with your new class list.
  - Replace `COCO_TO_TRASH` with an identity map if your class names already match `yoloClass` in `degradation.json`.
- Update `NUM_CLASSES` in `detection.ts`.
- Rebuild: `npm run android`.

---

## Troubleshooting

**`yolov8n.tflite` not found at runtime**

- Confirm the file is in `assets/models/`.
- Confirm `metro.config.js` has `config.resolver.assetExts.push('tflite')`.
- Clean & rebuild: `npx expo prebuild --clean && npm run android`.

**Black camera screen**

- Check camera permission in phone settings → TrashLife → Permissions.
- Make sure `isActive={!busy}` toggles back to true after snap.

**Crashes on launch (Android)**

- `Failed to load model`: the TFLite file is corrupt or wasn't bundled. Verify `ls assets/models/yolov8n.tflite` ≈ 3.17 MB. Re-download if needed.
- `Worklets not installed`: make sure `react-native-worklets-core/plugin` is listed in `babel.config.js` plugins **before** `react-native-reanimated/plugin`.

**NativeWind classes don't apply**

- Make sure `import './global.css'` is at the top of `App.tsx`.
- Confirm `nativewind/metro` wraps the config in `metro.config.js`.
- Restart Metro with `npm start -- --reset-cache`.

**Model loads but no detections appear**

- Point at something YOLO knows — a bottle, cup, phone, book. Random objects won't trigger.
- Lower `DETECTION_CONFIDENCE_THRESHOLD` to `0.25` in `detection.ts` and rebuild to debug.
- Check Metro logs for `YOLO model failed to load` errors.

**Expo Go doesn't work**

- It won't — you need a dev client. Run `npm run android` (builds + installs the dev client).

---

## Roadmap

- [x] Real YOLOv8n TFLite on-device inference
- [x] shadcn-style UI (NativeWind + reusables)
- [x] 48-item degradation DB + dashboard + diary
- [ ] Fine-tuned trash-specific model (TACO / TrashNet)
- [ ] Real OCR (MLKit text-recognition)
- [ ] Recycling location lookup (Google Places API)
- [ ] Firebase sync (diary across devices)
- [ ] Pro paywall (RevenueCat)
- [ ] Batch mode
- [ ] B2B audit CSV export

---

## License

See [LICENSE](LICENSE).
