# Deepfake Awareness & Detection System

> **Using Artificial Intelligence to Identify, Explain, and Mitigate Synthetic Media Manipulation**

---

## 👥 Project Contributors
* **Akash U** (4MK25AI003) — *Computer Vision & Temporal Video Analysis Lead*
* **Aryan H V** (4MK25AI005) — *Audio Forensics & Metadata Analysis Lead*
* **Libin P Chacko** (4MK25AI018) — *Explainable AI (Grad-CAM) & Fusion Model Lead*
* **Pruthvish B Shetty** (4MK25AI031) — *Full-Stack Architecture & Awareness System Lead*

---

## 🌟 Key Differentiators
1. **Multi-Modal Detection Pipeline:** Evaluates visual facial artifacts, audio spectral anomalies (synthetic voice patterns), and EXIF/C2PA digital provenance.
2. **Explainable AI (XAI):** Generates Grad-CAM visual attention heatmaps indicating exact artifact regions (jaw blending, unnatural eye reflections, texture warping).
3. **Dual Purpose:** Technical forensic tool paired with a public **Awareness & Literacy Hub** ("Verify Before You Share" guidelines & interactive detection quiz).

---

## 🏗️ Project Architecture & Directory Layout

```
deepfake-defense-system/
├── backend/                  # FastAPI REST Service & AI Inference Engine
│   ├── app/
│   │   ├── main.py           # Application entrypoint & routes
│   │   ├── services/         # Modular detection engines
│   │   │   ├── vision_detector.py   # Facial crop & CNN/Transformer analysis
│   │   │   ├── audio_detector.py    # Mel-spectrogram & voice clone detection
│   │   │   ├── metadata_detector.py # EXIF & C2PA provenance extraction
│   │   │   ├── explainability.py    # Grad-CAM heatmap generation
│   │   │   └── fusion.py            # Multi-modal risk score aggregator
│   └── requirements.txt      # Backend Python dependencies
├── frontend/                 # Interactive Cyber Defense Dashboard
│   ├── app.py                # Streamlit prototype with cyan/navy cyber UI
│   └── requirements.txt      # Frontend dependencies
├── notebooks/                # Model training & fine-tuning experiments
│   ├── 01_vision_baseline_cifake.ipynb
│   └── 02_audio_mel_spectrogram_classifier.ipynb
├── data/
│   └── sample_media/         # Demo authentic and deepfake test files
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Set Up Python Virtual Environment
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r backend/requirements.txt
pip install -r frontend/requirements.txt
```

### 3. Launch Backend API
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
*API Documentation will be live at `http://127.0.0.1:8000/docs`*

### 4. Launch Interactive Frontend Dashboard
```bash
cd frontend
streamlit run app.py
```
*Dashboard will open in your browser at `http://localhost:8501`*
