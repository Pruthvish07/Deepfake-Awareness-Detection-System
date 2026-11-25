"""
FastAPI Backend Entrypoint
Deepfake Awareness & Detection System
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from app.services.vision_detector import VisionDetector
from app.services.audio_detector import AudioDetector
from app.services.metadata_detector import MetadataDetector
from app.services.explainability import ExplainabilityEngine
from app.services.fusion import MultiModalFusion

app = FastAPI(
    title="Deepfake Awareness & Detection Engine API",
    description="Multi-modal AI pipeline to identify, explain, and mitigate synthetic media manipulation.",
    version="1.0.0"
)

# Enable CORS for frontend integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "project": "Deepfake Awareness & Detection System",
        "status": "Operational",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "pipeline_ready": True}

@app.post("/api/analyze")
async def analyze_media(file: UploadFile = File(...)):
    """
    Main forensic analysis endpoint:
    Processes uploaded file across Visual, Audio, Metadata & Explainability pipelines.
    """
    try:
        content = await file.read()
        filename = file.filename.lower()
        
        # 1. Metadata check
        metadata_results = MetadataDetector.analyze_image_bytes(content)
        
        # 2. Vision analysis
        vision_results = VisionDetector.analyze_image(content)
        
        # 3. Audio analysis (if audio or video)
        audio_results = AudioDetector.analyze_audio(content)
        
        # 4. Multi-modal fusion
        fusion_summary = MultiModalFusion.fuse_scores(vision_results, audio_results, metadata_results)
        
        # 5. Explainability (Grad-CAM Anomaly Heatmap)
        heatmap_base64 = ExplainabilityEngine.generate_attention_heatmap(content)
        
        return {
            "filename": file.filename,
            "fusion": fusion_summary,
            "visual_forensics": vision_results,
            "audio_forensics": audio_results,
            "metadata_forensics": metadata_results,
            "explainability": {
                "heatmap_overlay_base64": heatmap_base64,
                "detected_regions": ["Face perimeter", "Periorbital eye region"] if fusion_summary["risk_score"] > 0.4 else ["No abnormal focal artifacts"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")

@app.get("/api/awareness/quiz")
def get_awareness_quiz():
    """Returns interactive questions for the public media literacy module."""
    return [
        {
            "id": 1,
            "question": "What is one of the most reliable visual cues of face-swapped deepfakes?",
            "options": [
                "Unnatural blinking patterns or blurred boundary edges along the jawline",
                "High video resolution",
                "Black and white color grading",
                "Quick camera movements"
            ],
            "correct_answer_index": 0,
            "explanation": "Generative face-swapping often introduces blurring where the donor face blends with the recipient's neck and hairline, alongside abnormal blink rates."
        },
        {
            "id": 2,
            "question": "In cloned audio deepfakes, what anomaly often reveals synthetic speech?",
            "options": [
                "Loud background music",
                "Missing high-frequency harmonics and robotic prosody without natural breathing pauses",
                "Clear pronunciation",
                "Fast speaking rate"
            ],
            "correct_answer_index": 1,
            "explanation": "Neural vocoders frequently clip frequencies above 8-12 kHz and struggle with biological acoustic cues like subtle breathing and throat resonance."
        },
        {
            "id": 3,
            "question": "What is C2PA?",
            "options": [
                "A computer graphic card",
                "An open technical standard for content provenance and digital provenance watermarking",
                "A video file format",
                "A deep learning optimizer"
            ],
            "correct_answer_index": 1,
            "explanation": "Coalition for Content Provenance and Authenticity (C2PA) certifies the lineage and editing history of digital media."
        }
    ]
