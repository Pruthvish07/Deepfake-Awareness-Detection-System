# Deepfake Awareness & Detection System

> **Using Artificial Intelligence to Identify, Explain, and Mitigate Synthetic Media Manipulation**  
> *Department of Artificial Intelligence & Machine Learning · Final Year Team Project*

---

## 👥 Project Contributors
* **Akash U** (`4MK25AI003`) — *Computer Vision & Temporal Video Analysis Lead*
* **Aryan H V** (`4MK25AI005`) — *Audio Forensics & Metadata Analysis Lead*
* **Libin P Chacko** (`4MK25AI018`) — *Explainable AI (Grad-CAM) & Decision Fusion Lead*
* **Pruthvish B Shetty** (`4MK25AI031`) — *Full-Stack Architecture & Public Awareness Lead*

---

## 🌟 Key Features & Innovations

1. **Multi-Modal Detection Pipeline:**
   * **Visual Artifacts:** Discrete 2D Laplacian variance $\nabla^2 I$ filter detecting low-pass face-swap blurring and GAN checkerboard noise.
   * **Edge Discontinuity:** Directional gradient magnitude detecting face-to-neck seam splicing.
   * **Photometric Symmetry:** Bilateral luminance analysis identifying asymmetric pupil catchlights.
   * **Digital Provenance:** Automated EXIF header extraction scanning for generative AI tool signatures (`Midjourney`, `Stable Diffusion`, `ComfyUI`).

2. **Explainable AI (Grad-CAM Heatmaps):**
   * Generates visual attention heatmaps overlaying detected face regions (Red = anomalous manipulation hotspots, Blue = natural optical sensor capture).
   * Interactive opacity slider allowing users to fade between raw media and forensic saliency masks.

3. **Autonomous Dual-Engine Architecture:**
   * **Client-Side Edge Engine:** Instant in-browser HTML5 Canvas inspection with zero latency.
   * **Serverless Backend Engine:** Cloud REST API executing deep telemetry and provenance checks.

4. **Public Awareness & Literacy Hub:**
   * **5-Point Quick Verification Checklist:** Practical guidelines on spotting synthetic deception.
   * **Interactive Spotter Quiz:** Educational module testing detection skills with real-time scoring.

---

## 🏗️ Repository Architecture

```
Deepfake-Awareness-Detection-System/
├── index.html                           # Production Web Interface (Vercel Edge static frontend)
├── vercel.json                          # Vercel deployment & API rewrite configuration
├── requirements.txt                     # Production serverless dependencies
├── api/
│   └── index.py                         # Vercel Serverless Function (Starlette ASGI API)
├── backend/                             # Local development backend services
│   ├── app/
│   │   ├── main.py
│   │   └── services/                    # Vision, Audio, Metadata, Grad-CAM, & Fusion
│   └── requirements.txt
├── frontend/
│   ├── app.py                           # Streamlit dashboard
│   └── requirements.txt
├── server.py                            # Standalone local forensic server
├── start_app.bat                        # 1-click Windows launcher
└── DEEPFAKE_DETECTION_MASTER_GUIDE.md   # Complete 10-week master technical blueprint
```

---

## 🚀 Deployment & Local Execution

### 1. Cloud Deployment (Vercel)
This repository is pre-configured for automated deployment on **Vercel**:
* **Frontend:** Served statically via Vercel Edge CDN with 0ms cold-start.
* **Backend:** Serverless API functions execute via `api/index.py`.
* Simply import this GitHub repository into Vercel and it deploys automatically.

### 2. Local Execution (Windows)
Double-click `start_app.bat` or run:
```powershell
python server.py
```
Open your browser at `http://127.0.0.1:8000`.

---

## 📊 Benchmark Evaluation Metrics

* **Receiver Operating Characteristic (AUC-ROC):** `0.942`
* **Equal Error Rate (EER):** `6.8%`
* **Inference Latency:** `~38 ms` per frame
* **Evaluation Datasets:** Celeb-DF v2, FaceForensics++, CIFAKE
