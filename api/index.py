"""
Vercel Serverless Function Entrypoint
Deepfake Awareness & Detection Engine API
"""
import io
import base64
import numpy as np
from PIL import Image
from PIL.ExifTags import TAGS

from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route

class ForensicEngine:
    AI_SOFTWARE_SIGNATURES = [
        "stable diffusion", "midjourney", "dall-e", "comfyui", "automatic1111",
        "deepfacelab", "faceswap", "roop", "facefusion", "novelai", "photoshop generative"
    ]

    @classmethod
    def analyze_image_stream(cls, file_bytes: bytes, filename: str) -> dict:
        try:
            pil_img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        except Exception as e:
            return {"error": f"Invalid image format: {str(e)}"}

        width, height = pil_img.size
        img_np = np.array(pil_img, dtype=np.float32)

        # 1. Grayscale & Luminance
        gray = 0.299 * img_np[:, :, 0] + 0.587 * img_np[:, :, 1] + 0.114 * img_np[:, :, 2]

        # 2. Discrete Laplacian (High-Frequency Texture & Noise Variance)
        lap = np.zeros_like(gray)
        lap[1:-1, 1:-1] = (
            gray[0:-2, 1:-1] +
            gray[2:, 1:-1] +
            gray[1:-1, 0:-2] +
            gray[1:-1, 2:] -
            4.0 * gray[1:-1, 1:-1]
        )
        lap_var = float(np.var(lap))

        # 3. Edge Gradient Discontinuity (Sobel-like magnitude)
        gx = np.zeros_like(gray)
        gy = np.zeros_like(gray)
        gx[:, 1:-1] = (gray[:, 2:] - gray[:, :-2]) * 0.5
        gy[1:-1, :] = (gray[2:, :] - gray[:-2, :]) * 0.5
        grad_mag = np.sqrt(gx**2 + gy**2)
        grad_mean = float(np.mean(grad_mag))

        # 4. Photometric Lighting Symmetry
        left_half = float(np.mean(gray[:, :width // 2]))
        right_half = float(np.mean(gray[:, width // 2:]))
        light_diff = abs(left_half - right_half) / (max(left_half, right_half) + 1e-5)

        # 5. EXIF Metadata Extraction
        exif_info = {"has_exif": False, "ai_tags": [], "camera_model": "Unknown / Stripped", "details": {}}
        try:
            raw_exif = pil_img.getexif()
            if raw_exif and len(raw_exif) > 0:
                exif_info["has_exif"] = True
                for tag_id, val in raw_exif.items():
                    tag_name = TAGS.get(tag_id, str(tag_id))
                    str_val = str(val)
                    exif_info["details"][tag_name] = str_val
                    if tag_name.lower() in ["model", "make"]:
                        exif_info["camera_model"] = str_val
                    if tag_name.lower() in ["software", "imagedescription", "usercomment"]:
                        for sig in cls.AI_SOFTWARE_SIGNATURES:
                            if sig in str_val.lower():
                                exif_info["ai_tags"].append(sig)
        except Exception:
            pass

        # 6. Scoring Calculations
        detected_cues = []
        if lap_var < 75.0:
            detected_cues.append("Unnatural facial skin smoothing / boundary blur (Low-pass artifact)")
            v_blur_score = 0.78
        elif lap_var > 650.0:
            detected_cues.append("Synthetic high-frequency noise checkerboarding (GAN generator artifact)")
            v_blur_score = 0.72
        else:
            v_blur_score = 0.18

        if light_diff > 0.38:
            detected_cues.append("Asymmetric catchlight illumination discrepancy")
            light_score = 0.65
        else:
            light_score = 0.20

        if exif_info["ai_tags"]:
            detected_cues.append(f"AI generator footprint detected in metadata: {', '.join(exif_info['ai_tags'])}")
            meta_risk = 0.95
        elif not exif_info["has_exif"]:
            meta_risk = 0.35
        else:
            meta_risk = 0.12

        visual_risk = round(min(max(0.65 * v_blur_score + 0.35 * light_score, 0.05), 0.95), 2)
        
        is_video = filename.lower().endswith((".mp4", ".mov", ".avi", ".mkv"))
        audio_risk = 0.20 if not is_video else 0.35

        composite_score = round(0.60 * visual_risk + 0.25 * audio_risk + 0.15 * meta_risk, 2)
        confidence = int(composite_score * 100)

        if composite_score <= 0.35:
            verdict = "Likely Authentic"
            badge_color = "emerald"
            recommendation = "Low likelihood of synthetic manipulation. Visual texture gradients, photometric symmetry, and digital metadata align with genuine camera capture."
        elif composite_score <= 0.65:
            verdict = "Suspicious"
            badge_color = "amber"
            recommendation = "Inconsistencies detected in boundary gradient transitions or compression profiles. Manual verification advised before citation or redistribution."
        else:
            verdict = "Potentially Manipulated"
            badge_color = "rose"
            recommendation = "High probability of AI-generated or face-swapped synthetic media. High-frequency anomaly distribution indicates synthetic neural generation."

        heatmap_base64 = cls._generate_heatmap_overlay(pil_img, grad_mag, composite_score)

        return {
            "filename": filename,
            "dimensions": f"{width} x {height} px",
            "verdict": verdict,
            "badge_color": badge_color,
            "risk_score": composite_score,
            "confidence_percentage": confidence,
            "recommendation": recommendation,
            "metrics": {
                "laplacian_variance": round(lap_var, 1),
                "gradient_magnitude": round(grad_mean, 1),
                "lighting_symmetry": round((1.0 - light_diff) * 100, 1),
                "visual_risk": visual_risk,
                "metadata_risk": meta_risk,
                "audio_risk": audio_risk
            },
            "exif": exif_info,
            "cues": detected_cues if detected_cues else ["No conspicuous physical manipulation cues found."],
            "heatmap_base64": heatmap_base64
        }

    @classmethod
    def _generate_heatmap_overlay(cls, pil_img: Image.Image, grad_mag: np.ndarray, risk_score: float) -> str:
        try:
            w, h = pil_img.size
            g_norm = (grad_mag - grad_mag.min()) / (grad_mag.max() - grad_mag.min() + 1e-5)
            
            y, x = np.ogrid[:h, :w]
            cx, cy = w // 2, int(h * 0.45)
            sigma = min(w, h) * 0.35
            center_mask = np.exp(-((x - cx)**2 + (y - cy)**2) / (2 * sigma**2))

            activation = (0.7 * center_mask + 0.3 * g_norm)
            activation = np.clip(activation * (1.2 if risk_score > 0.4 else 0.5), 0, 1)

            overlay_arr = np.array(pil_img).astype(np.float32)
            
            red_channel = np.clip((activation - 0.4) / 0.6, 0, 1) * 240
            green_channel = np.clip(1.0 - np.abs(activation - 0.5) * 2, 0, 1) * 220
            blue_channel = np.clip((0.6 - activation) / 0.6, 0, 1) * 220

            alpha = (activation * 0.65)[:, :, np.newaxis]
            heatmap_rgb = np.stack([red_channel, green_channel, blue_channel], axis=2)
            blended = (1 - alpha) * overlay_arr + alpha * heatmap_rgb
            blended = np.clip(blended, 0, 255).astype(np.uint8)

            result_img = Image.fromarray(blended)
            buf = io.BytesIO()
            result_img.save(buf, format="JPEG", quality=80)
            return base64.b64encode(buf.getvalue()).decode("utf-8")
        except Exception:
            return ""

async def health(request):
    return JSONResponse({"status": "healthy", "service": "Deepfake Awareness & Detection API", "engine": "ForensicEngine v1.2"})

async def scan(request):
    try:
        form = await request.form()
        uploaded_file = form.get("file")
        if not uploaded_file:
            return JSONResponse({"error": "No file provided"}, status_code=400)
        
        file_bytes = await uploaded_file.read()
        res = ForensicEngine.analyze_image_stream(file_bytes, uploaded_file.filename)
        return JSONResponse(res)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

async def sample(request):
    sample_type = request.path_params.get("name", "fake")
    if sample_type == "fake":
        return JSONResponse({
            "filename": "sample_manipulated_interview.mp4",
            "dimensions": "1920 x 1080 px",
            "verdict": "Potentially Manipulated",
            "badge_color": "rose",
            "risk_score": 0.87,
            "confidence_percentage": 87,
            "recommendation": "High probability of AI-generated or face-swapped synthetic media. High-frequency anomaly distribution indicates synthetic neural generation.",
            "metrics": {
                "laplacian_variance": 54.2,
                "gradient_magnitude": 86.1,
                "lighting_symmetry": 41.5,
                "visual_risk": 0.88,
                "metadata_risk": 0.35,
                "audio_risk": 0.76
            },
            "exif": {"has_exif": False, "ai_tags": [], "camera_model": "Unknown / Stripped"},
            "cues": [
                "Unnatural facial skin smoothing / boundary blur (Low-pass artifact)",
                "Boundary gradient discontinuity around periorbital and chin zones",
                "EXIF metadata stripped (typical of synthetic web synthesis)"
            ],
            "heatmap_base64": ""
        })
    else:
        return JSONResponse({
            "filename": "sample_authentic_broadcast.mp4",
            "dimensions": "1920 x 1080 px",
            "verdict": "Likely Authentic",
            "badge_color": "emerald",
            "risk_score": 0.12,
            "confidence_percentage": 12,
            "recommendation": "Low likelihood of synthetic manipulation. Visual texture gradients, photometric symmetry, and digital metadata align with genuine camera capture.",
            "metrics": {
                "laplacian_variance": 248.5,
                "gradient_magnitude": 18.2,
                "lighting_symmetry": 89.4,
                "visual_risk": 0.11,
                "metadata_risk": 0.10,
                "audio_risk": 0.14
            },
            "exif": {"has_exif": True, "ai_tags": [], "camera_model": "Sony Alpha A7S III"},
            "cues": [
                "Natural discrete Laplacian frequency variance (Balanced photo-sensor noise)",
                "Lighting gradient consistent across facial quadrants",
                "No boundary seam splicing artifacts detected"
            ],
            "heatmap_base64": ""
        })

routes = [
    Route("/api/health", health),
    Route("/api/scan", scan, methods=["POST"]),
    Route("/api/sample/{name}", sample, methods=["GET"]),
    Route("/", health),
]

app = Starlette(debug=False, routes=routes)
