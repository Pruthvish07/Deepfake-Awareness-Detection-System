"""
Multi-Modal Decision Fusion Core
Responsible Team Members: Libin P Chacko & Pruthvish B Shetty
"""
from typing import Dict, Any

class MultiModalFusion:
    @staticmethod
    def fuse_scores(visual_res: Dict[str, Any], audio_res: Dict[str, Any], meta_res: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates weighted composite risk score and generates human-readable forensic verdict.
        Classification Tiers:
        - 0.00 to 0.35: "Likely Authentic" (Green)
        - 0.36 to 0.65: "Suspicious" (Amber/Yellow)
        - 0.66 to 1.00: "Potentially Manipulated" (Red)
        """
        v_score = visual_res.get("visual_risk_score", 0.1)
        a_score = audio_res.get("audio_risk_score", 0.0)
        m_score = meta_res.get("metadata_risk_score", 0.1)
        
        has_audio = audio_res.get("has_audio", False)
        
        # Dynamic weighting based on available modalities
        if has_audio:
            # Multi-modal (Video with Audio)
            composite_score = (0.55 * v_score) + (0.30 * a_score) + (0.15 * m_score)
        else:
            # Image only or Silent Video
            composite_score = (0.80 * v_score) + (0.20 * m_score)
            
        composite_score = round(composite_score, 2)
        confidence = int(composite_score * 100)
        
        if composite_score <= 0.35:
            verdict = "Likely Authentic"
            badge_color = "#10B981"  # Emerald Green
            recommendation = "Low likelihood of synthetic manipulation. Visual and metadata features align with natural media."
        elif composite_score <= 0.65:
            verdict = "Suspicious"
            badge_color = "#F59E0B"  # Amber
            recommendation = "Inconsistencies detected in face boundaries or compression profiles. Manual verification advised before sharing."
        else:
            verdict = "Potentially Manipulated"
            badge_color = "#EF4444"  # Red
            recommendation = "High probability of AI-generated or face-swapped synthetic content. Do not rely on this media without independent provenance verification."

        return {
            "verdict": verdict,
            "risk_score": composite_score,
            "confidence_percentage": confidence,
            "badge_color": badge_color,
            "recommendation": recommendation,
            "breakdown": {
                "visual_risk": v_score,
                "audio_risk": a_score,
                "metadata_risk": m_score
            }
        }
