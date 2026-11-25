"""
Metadata & Digital Provenance Forensics Service
Responsible Team Member: Aryan H V
"""
import io
from typing import Dict, Any
from PIL import Image
from PIL.ExifTags import TAGS

class MetadataDetector:
    AI_SOFTWARE_SIGNATURES = [
        "stable diffusion", "midjourney", "dall-e", "comfyui", "automatic1111",
        "deepfacelab", "faceswap", "roop", "facefusion", "novelai", "photoshop generative"
    ]

    @classmethod
    def analyze_image_bytes(cls, image_bytes: bytes) -> Dict[str, Any]:
        """Extracts EXIF metadata and detects AI generation footprints."""
        result = {
            "has_exif": False,
            "software": None,
            "ai_signatures_found": [],
            "metadata_risk_score": 0.0,
            "details": {}
        }
        
        try:
            image = Image.open(io.BytesIO(image_bytes))
            raw_exif = image.getexif()
            
            if not raw_exif:
                # Stripped metadata is common in social media downloads or synthetic generators
                result["has_exif"] = False
                result["metadata_risk_score"] = 0.35  # Mild suspicion
                result["details"]["note"] = "No EXIF metadata present. Metadata may have been stripped during re-compression or generation."
                return result

            result["has_exif"] = True
            exif_data = {}
            for tag_id, value in raw_exif.items():
                tag_name = TAGS.get(tag_id, str(tag_id))
                str_val = str(value)
                exif_data[tag_name] = str_val
                
                # Check for software signatures
                if tag_name.lower() in ["software", "imagedescription", "usercomment"]:
                    lower_val = str_val.lower()
                    for sig in cls.AI_SOFTWARE_SIGNATURES:
                        if sig in lower_val:
                            result["ai_signatures_found"].append(sig)
                            result["metadata_risk_score"] = 0.95
                            result["software"] = str_val

            result["details"] = exif_data
            if not result["ai_signatures_found"]:
                result["metadata_risk_score"] = 0.10  # Standard camera metadata found
                
        except Exception as e:
            result["details"]["error"] = str(e)
            result["metadata_risk_score"] = 0.40

        return result
