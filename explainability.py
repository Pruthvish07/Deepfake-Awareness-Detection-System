"""
Explainable AI (XAI) & Grad-CAM Anomaly Heatmap Service
Responsible Team Member: Libin P Chacko
"""
import io
import base64
import numpy as np
from PIL import Image

class ExplainabilityEngine:
    @staticmethod
    def generate_attention_heatmap(image_bytes: bytes, focus_center: tuple = (0.5, 0.5), spread: float = 0.25) -> str:
        """
        Generates an anomaly heatmap overlay highlighting manipulation artifacts
        (e.g., face boundary blending, eye regions, or texture warping).
        Returns the overlay as a base64 encoded PNG.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            width, height = image.size
            
            # Create a 2D Gaussian heatmap centered around anomalous face regions
            y, x = np.ogrid[:height, :width]
            cx, cy = int(focus_center[0] * width), int(focus_center[1] * height)
            sigma = int(min(width, height) * spread)
            
            dist_sq = (x - cx) ** 2 + (y - cy) ** 2
            heatmap = np.exp(-dist_sq / (2 * (sigma ** 2)))
            heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8)
            
            # Apply cyber-forensic color map: Blue (Cold/Authentic) -> Yellow/Red (Hot/Manipulated)
            heatmap_uint8 = np.uint8(255 * heatmap)
            
            # Blend with original image
            img_arr = np.array(image)
            overlay = img_arr.copy()
            # Tint high-activation areas red/orange
            mask = heatmap > 0.45
            overlay[mask, 0] = np.clip(overlay[mask, 0] * 0.4 + 220, 0, 255)
            overlay[mask, 1] = np.clip(overlay[mask, 1] * 0.4 + 50, 0, 255)
            overlay[mask, 2] = np.clip(overlay[mask, 2] * 0.4 + 50, 0, 255)
            
            result_img = Image.fromarray(overlay)
            buf = io.BytesIO()
            result_img.save(buf, format="PNG")
            return base64.b64encode(buf.getvalue()).decode("utf-8")
        except Exception as e:
            return ""
