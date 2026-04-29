# Trashcam

> **Point your camera at trash. Get instant insights on decomposition, environmental impact, and disposal tips.**

A web-based real-time object detection app that helps you understand the environmental footprint of waste. Built for the UQIES x UQ Ventures x Emmanuel College hackathon.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)](https://vitejs.dev)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-COCO--SSD-orange)](https://www.tensorflow.org/js)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss)](https://tailwindcss.com)

---

## Features

- **Real-Time Detection** — Live bounding boxes powered by TensorFlow.js (COCO-SSD) in the browser
- **Degradation Database** — 48 trash items with decomposition times, CO₂ emissions, water usage, and toxicity data
- **Environmental Impact** — See the real cost of waste at a glance
- **Waste Diary** — Track your scans over time with a local-first dashboard
- **Instant Insights** — Get disposal tips and best practices for each item
- **Lightning Fast** — Built with Vite for instant page loads and HMR

---

## Quick Start

### Prerequisites
- **Node.js 18+**
- A modern browser with camera support

### Installation

```bash
# Clone and install
git clone <repo>
cd trashcams
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## How It Works

1. **Open Camera** — App requests camera access
2. **Point & Scan** — Aim at trash items, real-time detection shows bounding boxes
3. **Snap** — When confidence ≥ 60%, the snap button glows green
4. **Get Insights** — See decomposition time, environmental impact, and disposal tips
5. **Track** — Add to your waste diary, view stats on the dashboard

### Detection Quality

The model works best on everyday items: **bottles, cans, phones, books, food, utensils**, etc. 

For trash-specific detection (styrofoam, cigarette butts, batteries), you can fine-tune the model on a trash dataset (see below).

---

## Architecture

```
Camera Feed
    ↓
TensorFlow.js (COCO-SSD)
    ↓
Real-time Detections + Bounding Boxes
    ↓
User Captures Photo
    ↓
COCO → Trash Class Mapping
    ↓
Degradation DB Lookup
    ↓
Results + Environmental Stats
    ↓
Save to localStorage + Dashboard
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **ML Runtime** | TensorFlow.js + COCO-SSD |
| **Styling** | Tailwind CSS + Lucide Icons |
| **Routing** | React Router |
| **Charts** | Recharts |
| **Storage** | localStorage (local-first) |

---

## Project Structure

```
trashcams/
├── src/
│   ├── main.tsx                 # Vite entry point
│   ├── App.tsx                  # Router & main layout
│   ├── index.css                # Tailwind + global styles
│   ├── components/              # UI components
│   │   ├── ScannerScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   └── ...
│   ├── hooks/                   # Custom React hooks
│   │   ├── useYolo.ts           # TensorFlow.js detection
│   │   └── useScan.ts
│   ├── services/                # Business logic
│   │   ├── detection.ts         # YOLO parsing + NMS
│   │   ├── cocoClasses.ts       # COCO class mappings
│   │   └── degradationDb.ts     # Trash database
│   ├── data/                    # JSON databases
│   │   └── degradation.json     # 48-item trash database
│   └── types/                   # TypeScript definitions
├── public/                      # Static assets
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json                # Dependencies & scripts
```

---

## Degradation Database

Each trash item includes:

- **Material** — Type of waste (plastic, metal, organic, etc.)
- **Decomposition Time** — How long it takes to break down
- **CO₂ Emissions** — Carbon footprint of production
- **Water Usage** — Water consumed in manufacturing
- **Toxicity Level** — Environmental hazard rating
- **Disposal Tip** — Best way to handle it

---

## Configuration

### Detection Thresholds

Edit `src/services/detection.ts` to tune:

```typescript
const DETECTION_CONFIDENCE_THRESHOLD = 0.4    // Show boxes above this
const SNAP_CONFIDENCE_THRESHOLD = 0.6         // Snap button glows at this
const NMS_IOU_THRESHOLD = 0.45               // Remove duplicate boxes
```

Lower confidence = more detections (but more false positives)
Higher confidence = fewer false positives (but might miss items)

---

## Training a Custom Model

The bundled model is trained on **COCO** (80 common objects). For trash-specific detection (styrofoam, specific containers, etc.), fine-tune on a trash dataset:

### 1. Install Ultralytics

```bash
pip install ultralytics
```

### 2. Choose a Dataset

- **[TACO](http://tacodataset.org/)** — 60 trash classes (~1,500 images)
- **[TrashNet](https://github.com/garythung/trashnet)** — 6 material types (~2,500 images)
- **[Roboflow Trash Datasets](https://universe.roboflow.com/search?q=garbage)** — Many options

### 3. Fine-Tune

```bash
yolo detect train \
    model=yolov8n.pt \
    data=path/to/dataset/data.yaml \
    epochs=50 \
    imgsz=640
```

### 4. Export to Web Format

```bash
# For ONNX (recommended for web)
yolo export model=runs/detect/train/weights/best.pt format=onnx

# Or TensorFlow.js format
yolo export model=runs/detect/train/weights/best.pt format=tfjs
```

### 5. Update the App

1. Replace the model in `src/services/`
2. Update class names in `src/services/cocoClasses.ts`
3. Update `src/data/degradation.json` with new trash types
4. Rebuild: `npm run build`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Camera not working** | Check browser permissions for camera access |
| **No detections appear** | Point at COCO items (bottle, cup, phone, book). Lower `DETECTION_CONFIDENCE_THRESHOLD` to debug |
| **Model loads slowly** | First load downloads ~20MB model. Subsequent loads use browser cache |
| **localStorage full** | Clear your browser data or export diary as CSV |

---

## Deployment

### Render (Pre-configured)

```yaml
# render.yaml is configured for automatic deployment
Build: npm install && npm run build
Publish: dist/
```

Just push to main and Render will deploy automatically.

### Other Platforms

The `dist/` folder is ready for deployment to:
- **Vercel** — `vercel deploy dist`
- **Netlify** — Drag & drop `dist/`
- **GitHub Pages** — Push `dist/` to `gh-pages` branch

---

## Roadmap

- [x] Web app with real-time detection
- [x] Degradation database (48 items)
- [x] Waste diary + dashboard
- [x] Beautiful UI with Tailwind
- [ ] Fine-tuned trash-specific model
- [ ] Recycling location finder (Google Maps API)
- [ ] Cloud sync (Firebase)
- [ ] Export diary as PDF/CSV
- [ ] Mobile app (React Native)

---

## Team

- **Peter Ma** — [LinkedIn](https://www.linkedin.com/in/peterzma/)
- **Siddhant Malik** — [LinkedIn](https://www.linkedin.com/in/siddhant-malik-34b622368/)
- **Adin Sreekesh** — [LinkedIn](https://www.linkedin.com/in/a-sreekesh/)

Built for the hackathon.

---

## Questions?

Have an idea? Found a bug? Open an issue or reach out!
