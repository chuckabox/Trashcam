# TrashLife

**A mobile app that points your camera at trash, identifies it with YOLO, and tells you how long it takes to decompose and how to dispose of it.**

This repo is an **MVP skeleton** — fully functional UI and data flow, with a **mock YOLO detector** that generates plausible detections so you can drive the whole app end-to-end on a real device today. Swap in a real TFLite model when you're ready (see [YOLO Model Swap-In](#yolo-model-swap-in)).

---

## Table of Contents

1. [What This App Does](#what-this-app-does)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Tech Stack](#tech-stack)
6. [Getting Started](#getting-started)
7. [YOLO Model Swap-In](#yolo-model-swap-in)
8. [OCR Swap-In](#ocr-swap-in)
9. [Degradation Database](#degradation-database)
10. [Roadmap](#roadmap)
11. [Monetization](#monetization)
12. [Performance Targets](#performance-targets)

---

## What This App Does

You point your phone at a piece of trash. The app:

1. Runs **real-time YOLO object detection** on the camera feed, drawing bounding boxes around trash items with the class name + confidence %.
2. When confidence crosses **80%**, the snap button glows — tap to capture.
3. The captured frame is run through **OCR** (brand, expiry, recycling codes).
4. The detected class is cross-referenced against the **degradation database** to show:
   - Material category (plastic, metal, glass, paper, organic, etc.)
   - Estimated decomposition time (days to millennia)
   - CO₂ footprint, water footprint, toxicity
   - Recyclable / compostable / landfill / hazardous classification
   - Specific disposal instructions
5. The scan is logged to the **waste diary** (local AsyncStorage).
6. The **dashboard** aggregates scans into KPIs, a material-breakdown pie chart, and a top-items list.

---

## Features

| Feature | Status |
|---|---|
| Real-time bounding box overlay on live camera | ✅ (mock detector, see swap-in) |
| Snap on confidence ≥ 80% | ✅ |
| Photo capture + thumbnail | ✅ |
| OCR on captured photo | 🔌 stubbed (returns mock labels — swap in MLKit or Claude Vision) |
| Degradation database (48 items) | ✅ |
| Results card with material / decomposition / CO₂ / water / toxicity / disposal tip | ✅ |
| Waste diary (local, persistent) | ✅ |
| Dashboard: totals, material pie chart, top items | ✅ |
| Local recycling location lookup | 🔜 (UI placeholder, wire to Google Places or Earth911 API) |
| Pro tier / payments | 🔜 |

---

## Architecture

```
                      ┌─────────────────────────┐
                      │   ScannerScreen         │
                      │   (expo-camera)         │
                      └──────────┬──────────────┘
                                 │ frames
                       ┌─────────▼────────┐
                       │   useYolo hook   │
                       │  (polling 200ms) │
                       └─────────┬────────┘
                                 │ Detection[]
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
   BoundingBoxOverlay     SnapButton          takePictureAsync
     (SVG-less, RN        (confidence %,       (on tap)
      absolute Views)      ready state)
                                                    │
                                                    ▼
                                            useOcr hook
                                            (recognizeText)
                                                    │
                                                    ▼
                                       lookup(yoloClass) → DegradationInfo
                                                    │
                                                    ▼
                                        saveScan(ScanResult) → AsyncStorage
                                                    │
                                                    ▼
                                        nav.navigate('Results', { scan })
```

Data flow is **one-way, local-first**: every scan goes to `AsyncStorage` immediately. The dashboard and diary both read from `loadScans()` on focus. No server is required for the MVP.

---

## Project Structure

```
emmanual/
├── App.tsx                       # Root, wraps RootNavigator
├── app.json                      # Expo config (camera permissions)
├── package.json
├── tsconfig.json
├── babel.config.js
├── assets/
│   └── models/                   # Drop YOLOv8 TFLite model here
├── src/
│   ├── navigation/
│   │   └── index.tsx             # Stack: Scanner → Results, Diary, Dashboard
│   ├── screens/
│   │   ├── ScannerScreen.tsx     # Live camera + YOLO overlay + snap
│   │   ├── ResultsScreen.tsx     # Degradation details + actions
│   │   ├── DiaryScreen.tsx       # Scan history list
│   │   └── DashboardScreen.tsx   # Totals + pie chart + top items
│   ├── components/
│   │   ├── BoundingBoxOverlay.tsx
│   │   ├── ResultsCard.tsx
│   │   └── SnapButton.tsx
│   ├── hooks/
│   │   ├── useYolo.ts            # Polls detector, returns Detection[]
│   │   └── useOcr.ts             # Async OCR trigger
│   ├── services/
│   │   ├── detection.ts          # YOLO stub (replace with TFLite)
│   │   ├── ocr.ts                # OCR stub (replace with MLKit/Claude)
│   │   ├── degradation.ts        # Lookup from JSON
│   │   └── storage.ts            # AsyncStorage wrapper + stats
│   ├── data/
│   │   └── degradation.json      # 48-item degradation database
│   └── types/
│       └── index.ts              # Shared TS types
```

---

## Tech Stack

- **React Native** 0.74 + **Expo SDK 51** (managed workflow; prebuild when native modules are added)
- **TypeScript** strict mode
- **expo-camera** for the live preview + capture
- **@react-navigation/native-stack** for routing
- **@react-native-async-storage/async-storage** for persistent diary
- **react-native-chart-kit** + **react-native-svg** for the dashboard pie chart
- **react-native-fast-tflite** (to be added at swap-in time) for on-device YOLO inference

---

## Getting Started

### Prerequisites
- Node 18+
- A physical device (iOS or Android) — camera does not work in simulators
- **Expo Go** app installed from the App Store / Play Store

### Install & run

```bash
npm install
npm start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS). Grant camera permission when prompted.

### What you'll see in the mock state

The app will draw bounding boxes at random positions with random trash classes from the degradation database. The snap button will glow green when one of those mock detections crosses 80% confidence. Tap it to snap and see the full flow: photo → OCR → results → saved to diary.

This lets you build, test and iterate the **UX** before the model is ready.

---

## YOLO Model Swap-In

The app runs the whole flow end-to-end with a mock detector (`src/services/detection.ts → mockDetect`). To use a real on-device YOLO model:

### 1. Get or train a model

- **Easiest:** download a pre-trained YOLOv8 Nano from [Ultralytics](https://github.com/ultralytics/ultralytics) and fine-tune on **[TrashNet](https://github.com/garythung/trashnet)** or **[TACO](http://tacodataset.org/)**.
- Classes to map to: `plastic_bottle`, `aluminum_can`, `cardboard_box`, `glass_bottle`, `paper`, `food_waste`, `styrofoam`, `battery`, etc. — every `yoloClass` string in [`src/data/degradation.json`](src/data/degradation.json).
- Any class your model outputs that is **not** in `degradation.json` will fall back to the `unknown` entry.

### 2. Export to TFLite

```bash
# From your Python training environment
yolo export model=yolov8n_trash.pt format=tflite int8=True
```

Target model size: **< 10 MB**. Target FPS: **24+** on mid-range Android.

### 3. Drop into the app

Place the exported file at `assets/models/yolov8n_trash.tflite`.

### 4. Wire up `react-native-fast-tflite`

```bash
npm install react-native-fast-tflite
npx expo prebuild          # one-time, generates android/ and ios/
npx expo run:ios           # or run:android
```

### 5. Replace `mockDetect` in [src/services/detection.ts](src/services/detection.ts)

Replace the function body with a real inference call. Sketch:

```ts
import { loadTensorflowModel } from 'react-native-fast-tflite';

let model: Awaited<ReturnType<typeof loadTensorflowModel>> | null = null;

export async function initModel() {
  model = await loadTensorflowModel(require('../../assets/models/yolov8n_trash.tflite'));
}

export async function detect(frame: Uint8Array): Promise<Detection[]> {
  if (!model) throw new Error('Model not loaded');
  const [output] = await model.run([frame]);
  return parseYoloOutput(output);   // you write this: NMS, class index → yoloClass string
}
```

Then flip `useYolo.ts` from a `setInterval(mockDetect)` to the camera's `onFrame` callback.

### 6. Tune thresholds

Both live in `src/services/detection.ts`:

```ts
export const DETECTION_CONFIDENCE_THRESHOLD = 0.6;  // draw box
export const SNAP_CONFIDENCE_THRESHOLD = 0.8;       // green snap button
```

---

## OCR Swap-In

The OCR layer is in [src/services/ocr.ts](src/services/ocr.ts) as `recognizeText(imageUri)`. Two realistic paths:

**A) On-device (free, private):** `@react-native-ml-kit/text-recognition`

```ts
import TextRecognition from '@react-native-ml-kit/text-recognition';
export async function recognizeText(uri: string) {
  const result = await TextRecognition.recognize(uri);
  return result.text || undefined;
}
```

**B) Cloud (higher accuracy, costs money):** Claude Vision API — POST the base64 image to `/v1/messages` with an image content block, ask for any visible text back.

Crop the image to the YOLO bounding box first for better accuracy:

```ts
import * as ImageManipulator from 'expo-image-manipulator';
const crop = await ImageManipulator.manipulateAsync(uri, [{ crop: bboxInPixels }]);
const text = await recognizeText(crop.uri);
```

---

## Degradation Database

[src/data/degradation.json](src/data/degradation.json) holds 48 common items. Each entry:

```jsonc
{
  "id": "plastic_bottle",
  "yoloClass": "plastic_bottle",          // must match your YOLO output label
  "displayName": "Plastic Water Bottle (PET)",
  "material": "plastic",
  "decompositionYears": 450,
  "co2KgPerItem": 0.08,
  "waterLitersPerItem": 3.0,
  "toxicity": "medium",
  "recyclable": "recyclable",              // recyclable | compostable | landfill | hazardous
  "disposalTip": "Rinse, remove cap and label, place in #1 PET recycling bin.",
  "emoji": "🧴"
}
```

**To add items:** append to the JSON. The UI, dashboard and lookup pick them up automatically. Values are rough public-data estimates — replace with citations for production.

---

## Roadmap

**Weeks 1–3 (MVP — this repo):**
- [x] RN/Expo scaffold, navigation, theme
- [x] Live camera + bounding-box overlay
- [x] Snap flow, local storage, diary, dashboard
- [x] Degradation DB (48 items)
- [ ] Real YOLOv8 TFLite model wired via `react-native-fast-tflite`
- [ ] Real OCR (MLKit)

**Weeks 4–6:**
- [ ] Firebase Auth + Firestore sync (so diary follows the user across devices)
- [ ] Local recycling lookup (Google Places or Earth911 API, query by material + lat/lng)
- [ ] Pro paywall (`revenuecat`)

**Weeks 7+:**
- [ ] Batch mode (scan 10 items rapid-fire)
- [ ] Carbon offset integration (Wren / Patch)
- [ ] B2B audit tools (CSV export, bulk upload)
- [ ] Active-learning: log misidentified scans, retrain model monthly

---

## Monetization

- **Free:** 5 scans/day, basic detection, dashboard.
- **Pro — $7.99/mo:** unlimited scans, OCR, carbon reports, batch mode.
- **B2B:** license the YOLO model + `/detect` API to waste-management companies, schools, municipalities for audits.

---

## Performance Targets

| Metric | Target | Current |
|---|---|---|
| YOLO detection latency | < 150 ms | mock: ~200 ms polling interval |
| Detection accuracy (top-5 common trash) | ≥ 85% | model-dependent |
| OCR accuracy (legible labels) | ≥ 80% | stubbed |
| Snap → results screen | < 2 s | ~0.5 s (mock) |
| Model size on disk | < 10 MB | n/a |
| FPS on mid-range Android | 24+ | n/a |

---

## License

See [LICENSE](LICENSE).
