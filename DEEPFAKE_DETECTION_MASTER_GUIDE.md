# Deepfake Awareness & Detection System
## Comprehensive Master Blueprint & Step-by-Step Implementation Guide

**Project Scope:** AIML Final Year Team Project  
**Team Members:** Akash U (4MK25AI003), Aryan H V (4MK25AI005), Libin P Chacko (4MK25AI018), Pruthvish B Shetty (4MK25AI031)  
**Theme:** *Identify, Explain, and Mitigate Synthetic Media Manipulation*

---

## 1. Project Vision & Differentiator

Most college deepfake projects stop at: *"We passed an image through a CNN and it printed 'Real' or 'Fake' with 85% accuracy."* 

To score the highest marks from university evaluators and build a system with real-world impact, your project has three unique differentiators built directly from your slides:
1. **Multi-Modal Verification:** Checks **Visuals** (video frames, face boundaries), **Audio** (voice frequency inconsistencies, synthetic speech patterns), and **Metadata** (EXIF & C2PA content provenance).
2. **Explainable AI (XAI):** Doesn't just give a verdict; it highlights **where** the manipulation occurred using **Grad-CAM heatmaps** (e.g., mismatched boundary blending, abnormal eye regions, artifacts).
3. **Public Awareness & Actionability:** Features a "Verify Before You Share" public literacy module, scam detection tips, and an educational "Can You Spot the Deepfake?" interactive quiz.

```
       ┌────────────────────────────────────────────────────────┐
       │                User Upload (Video/Audio/Image)         │
       └───────────────────────────┬────────────────────────────┘
                                   │
         ┌─────────────────────────┼────────────────────────┐
         │                         │                        │
         ▼                         ▼                        ▼
┌─────────────────┐      ┌──────────────────┐     ┌──────────────────┐
│ Visual Pipeline │      │  Audio Pipeline  │     │ Metadata & C2PA  │
│ - Face Extractor│      │ - Mel Spectrogram│     │ - EXIF extraction│
│ - Spatial CNN/ViT      │ - Voice Artifacts│     │ - AI Tool Sign.  │
│ - Frame Aggreg. │      │ - Wav2Vec/ResNet │     │ - Compression chk│
└────────┬────────┘      └─────────┬────────┘     └────────┬─────────┘
         │                         │                       │
         └─────────────────────────┼───────────────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │    Multi-Modal Fusion Core    │
                   │  - Weighted Ensemble Score    │
                   │  - Explainability (Grad-CAM)  │
                   └───────────────┬───────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │  Interactive Dashboard UI    │
                   │  - Likely Authentic / Fake    │
                   │  - Anomaly Heatmap Visualizer │
                   │  - Audio Spectrogram Viewer   │
                   │  - Awareness / Literacy Hub   │
                   └───────────────────────────────┘
```

---

## 2. Recommended Platform & Tech Stack

To ensure that the project runs efficiently without requiring thousands of dollars of cloud GPUs, we recommend a hybrid local + free-tier cloud architecture:

### A. AI Model Development & Training Platform
* **Google Colab (Free T4 GPU / Pro) or Kaggle Kernels (30 hrs/week free Dual T4 GPU):**
  * **Why:** Deep learning on video and audio requires CUDA. Kaggle is ideal because it hosts datasets like *Deepfake Detection Challenge (DFDC)*, *Celeb-DF*, and *FaceForensics++* directly without downloading hundreds of gigabytes to local drives.
* **Weights & Biases (W&B):** Free for students to track model accuracy, loss curves, and evaluation metrics for your project report.

### B. Machine Learning Frameworks
* **PyTorch & Torchvision:** Standard for computer vision and deepfake research papers.
* **Facenet-PyTorch / MediaPipe / RetinaFace:** For ultra-fast face detection and crop extraction from video frames.
* **Torchaudio & Librosa:** For audio feature extraction (Mel-frequency cepstral coefficients - MFCCs, Mel-spectrograms).
* **PyTorch-Grad-CAM:** For explainable visual heatmaps.
* **Hugging Face Transformers / Timm:** For pre-trained backbones (EfficientNet-B4, MesoNet, Wav2Vec 2.0, or ConvNeXt).

### C. Backend API Service
* **FastAPI (Python 3.10+):**
  * Asynchronous processing for video frame sampling.
  * Direct integration with PyTorch tensors.
  * Auto-generated Swagger docs (`/docs`) for testing endpoints.
* **Celery + Redis (Optional for production) or Python BackgroundTasks:** For handling long video upload jobs.

### D. Frontend & Presentation Platform
* **Option 1 (Fastest to build, highly interactive): Streamlit or Gradio**
  * Custom styled with dark cyber-security theme (matching the slide aesthetic).
  * Ideal for rapid prototype submission and interim reviews.
* **Option 2 (Full-stack engineering showcase - Recommended for best project award): Next.js / React + Tailwind CSS + Lucide Icons + FastAPI Backend**
  * Sleek glassmorphism UI matching your slide designs (shields, glowing meters, face bounding boxes).
  * High responsiveness and portfolio-grade presentation.

### E. Metadata & File Forensics
* **ExifTool (pyexiftool):** Extracts camera sensor data, software tags, and timestamps.
* **C2PA Python SDK / Jumbf parser:** Checks Content Credentials provenance (supported by Adobe, Google, OpenAI, etc.).

---

## 3. Team Task Allocation (4 Members)

To make sure all 4 contributors (Pruthvish, Libin, Akash, Aryan) have well-defined, distinct contributions for viva examinations, academic reports, and coding:

| Member | Primary Role | Key Deliverables |
| :--- | :--- | :--- |
| **Member 1: Akash U** | **Computer Vision & Video Lead** | - Frame extraction & face alignment pipeline (RetinaFace/MediaPipe).<br>- Visual classification model (EfficientNet-B4 / MesoInception).<br>- Temporal consistency check across frames. |
| **Member 2: Aryan H V** | **Audio Forensics & Metadata Lead** | - Audio extraction from video using FFmpeg.<br>- Mel-Spectrogram & MFCC feature extractor.<br>- Synthetic voice detector (ResNet / CNN on spectrograms).<br>- EXIF metadata & provenance parser. |
| **Member 3: Libin P Chacko** | **Explainable AI (XAI) & Fusion Lead** | - Grad-CAM / Attention map generator overlaying detected face regions.<br>- Multi-modal score fusion (combining visual + audio + metadata weights).<br>- Benchmarking, accuracy tables, confusion matrices, and ROC curves. |
| **Member 4: Pruthvish B Shetty** | **Full-Stack Architecture & Awareness System Lead** | - FastAPI backend orchestration & endpoint integration.<br>- Interactive UI Dashboard (matching the slide's cyan/navy cyber aesthetic).<br>- Interactive Awareness Module: "Deepfake Quiz", warning indicators, and reporting guide.<br>- Project repository management, deployment, and slide/report harmonization. |

---

## 4. Technical Architecture: Step-by-Step Pipeline

### Step 1: Ingestion & Preprocessing
1. **User Uploads File:** `.mp4`, `.avi`, `.mov`, `.jpg`, `.png`, or `.wav`/`.mp3`.
2. **File Validation:**
   - If Video: Split audio track using `ffmpeg-python` -> route to Audio Pipeline. Sample 10–20 evenly spaced frames -> route to Visual Pipeline.
   - If Image: Route directly to Visual Pipeline and Metadata Pipeline.
   - If Audio: Route to Audio Pipeline.

### Step 2: Visual Detection & Artifact Analysis
1. Detect faces in each frame using `RetinaFace` or `MediaPipe FaceMesh`.
2. Crop and normalize face patches to `224x224` or `256x256`.
3. Pass cropped face tensors into a fine-tuned **EfficientNet-B4** or **ConvNeXt** model trained on deepfake datasets.
4. Calculate two critical metrics:
   - **Spatial Artifact Score:** Blurring around jawlines, odd reflections in irises, teeth irregularities.
   - **Temporal Inconsistency Score:** Blinking rate variance, jitter between consecutive frame predictions.

### Step 3: Audio Inconsistency Detection
1. Convert extracted audio to 16kHz mono WAV.
2. Generate **Mel-Spectrograms** (visual representations of sound frequencies over time).
3. Detect anomalies typical of neural vocoders (ElevenLabs, Bark, RVC, Tortoise):
   - Missing high-frequency harmonics (>8kHz cutoff common in older models).
   - Robotic pitch continuity / flat prosody without natural human breathing pauses.
4. Pass spectrogram into a lightweight 2D CNN (ResNet18) to output an **Audio Manipulation Probability**.

### Step 4: Explainability (Grad-CAM Integration)
1. For flagged frames, run **Grad-CAM** against the final convolutional layer of the vision backbone.
2. Generate a heat map highlighting the pixel regions that contributed most to the "Fake" verdict:
   - *Red/Yellow:* Edge blending artifacts around hair/chin, or unnatural eye regions.
   - *Blue:* Natural skin texture.
3. Superimpose the heatmap over the original image/frame for the user to see inside the dashboard.

### Step 5: Metadata & Provenance Check
1. Read file EXIF headers.
2. Look for generative AI tags (e.g., `Stable Diffusion`, `Midjourney`, `DALL-E`, `Photoshop Generative Fill`, `ComfyUI`).
3. Check for presence or stripping of **C2PA Content Credentials**.

### Step 6: Multi-Modal Fusion Engine
Combine individual scores into an overall confidence rating:
$$\text{Deepfake Risk Score} = w_v \cdot S_{\text{visual}} + w_a \cdot S_{\text{audio}} + w_m \cdot S_{\text{metadata}}$$
* If video has no audio: Normalize weights ($w_v = 0.85, w_m = 0.15$).
* Final classification:
  * **0% – 30%:** *Likely Authentic* (Green)
  * **31% – 65%:** *Suspicious / Inconclusive* (Yellow)
  * **66% – 100%:** *High Confidence Manipulation* (Red)

---

## 5. Datasets & Model Strategy (Pragmatic & Achievable)

Don't start training models from scratch with random weights; modern deepfake models rely on **transfer learning**:

| Domain | Recommended Dataset | Pre-trained Backbone / Starting Point |
| :--- | :--- | :--- |
| **Faces / Video** | **FaceForensics++ (FF++)** & **Celeb-DF v2** (Available on Kaggle) | Pretrained `timm/efficientnet_b4` or `timm/convnext_tiny` initialized on ImageNet |
| **AI Images (Diffusion/GANs)** | **CIFAKE Dataset** (Kaggle: 120,000 real & AI-generated images) | Great for instant 94%+ baseline benchmark within 1 hour |
| **Audio Voice Clones** | **ASVspoof 2019/2021** or **FakeAVCeleb** | Pretrained `facebook/wav2vec2-base` or Mel-Spectrogram + ResNet18 |

---

## 6. Implementation Roadmap (10-Week Plan)

### Weeks 1–2: Setup, Dataset Acquisition & Baseline PoC
- Setup GitHub organization and repository.
- Setup Kaggle/Colab notebooks.
- Run baseline binary classifier on **CIFAKE** dataset to establish working pipeline.
- Initialize FastAPI backend and wire up basic file upload endpoint.

### Weeks 3–4: Video Processing & Visual Model Fine-Tuning
- Implement video frame extraction and face-cropping with MediaPipe/RetinaFace.
- Fine-tune EfficientNet-B4 on Celeb-DF / FaceForensics++ face crops.
- Evaluate AUC-ROC, Precision, and Recall.

### Weeks 5–6: Audio Detection & Metadata Forensics
- Implement audio extraction with FFmpeg.
- Build Mel-spectrogram generator and train audio classifier.
- Implement metadata extractor (EXIF + software fingerprints).

### Weeks 7–8: Explainability (Grad-CAM) & Fusion System
- Attach Grad-CAM to vision pipeline to generate visual anomaly heatmaps.
- Implement weighted multi-modal decision fusion logic.
- Conduct stress tests with real vs. manipulated YouTube/social media clips.

### Weeks 9–10: Modern Cyber Dashboard, Awareness Hub & Documentation
- Build sleek Dashboard UI (Upload, Gauge Meter, Anomaly Heatmaps, Audio Waveform).
- Build the "Deepfake Awareness & Education Hub" (interactive quiz, tips, report generator).
- Prepare final project report (IEEE format), slides, and live demonstration video.

---

## 7. Deliverables Checklist for Evaluators & Vivas

1. **Live Working System:** Real-time web application where an examiner can drop any video/photo and see the verdict + heatmap.
2. **IEEE Format Research Paper:** Ready for submission to a student conference (e.g., IEEE ICACCS, IEEE DISCOVER, or college symposium).
3. **Model Evaluation Metrics:** Confusion matrix, ROC curve, F1-score comparison between models.
4. **Interactive Awareness Hub:** Shows your project is not just a model, but a complete solution to a societal challenge.
