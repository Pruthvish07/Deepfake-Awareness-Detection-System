/**
 * Lightweight Vercel Serverless Function: /api/analyze
 * Feature Layer 2: AI Deepfake Multimodal Reasoning
 * Uses Google Gemini Free-Tier Multimodal Vision REST API
 * Models: gemini-4-hydrogen (primary) -> gemini-3.8-flash -> gemini-3.5-flash-lite
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      service: 'Dual-Mode AI Deepfake Multimodal Reasoning Endpoint',
      gemini_configured: !!process.env.GEMINI_API_KEY,
      models: ['gemini-4-hydrogen', 'gemini-3.8-flash', 'gemini-3.5-flash-lite']
    });
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ fallback: true, error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const imageBase64Raw = body?.image_base64 || body?.image || '';
    const filename = body?.filename || 'media.jpg';

    // Zero-Crash Guard: If GEMINI_API_KEY is missing, gracefully return fallback: true (HTTP 200, never 500)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        fallback: true,
        reason: 'GEMINI_API_KEY not configured in environment',
        engine: 'Client-Side Forensics Engine'
      });
    }

    const base64Data = imageBase64Raw.replace(/^data:image\/\w+;base64,/, '');
    const mimeType = imageBase64Raw.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    if (!base64Data || base64Data.length < 20) {
      return res.status(200).json({
        fallback: true,
        reason: 'No image payload provided',
        engine: 'Client-Side Forensics Engine'
      });
    }

    const prompt = `You are a certified digital media forensic investigator specialized in detecting deepfakes, face swaps, diffusion synthesis, and GAN manipulations.
Examine this image with extreme forensic scrutiny for:
1. Facial boundary blending (jawline, hairline, ears, collar seam splicing artifacts)
2. Skin texture uniformity (unnatural low-pass Gaussian smoothing vs natural optical sensor noise)
3. Corneal eye reflection symmetry (pupil catchlights illumination direction consistency)
4. Lighting and shadow consistency across facial quadrants
5. Ear, hair, background geometric anomalies and generative synthesis artifacts

Return STRICT raw JSON only (no markdown, no code blocks):
{
  "deepfake_probability": <float 0.00 to 1.00>,
  "verdict": <"Likely Authentic" | "Suspicious" | "Potentially Manipulated">,
  "confidence": <integer 0 to 100>,
  "forensic_findings": [
    "<concise finding 1>",
    "<concise finding 2>",
    "<concise finding 3>"
  ],
  "artifact_regions": [
    "<region 1, e.g. jawline_seam, left_pupil, hairline>",
    "<region 2>"
  ],
  "breakdown": {
    "boundary_blending": <float 0.00 to 1.00>,
    "corneal_reflections": <float 0.00 to 1.00>,
    "lighting_consistency": <float 0.00 to 1.00>,
    "texture_artifacts": <float 0.00 to 1.00>
  },
  "reasoning": "<concise 2-sentence forensic evaluation summary>"
}`;

    // Free-tier model hierarchy: gemini-4-hydrogen (primary) -> gemini-3.8-flash -> gemini-3.5-flash-lite
    const MODELS = ['gemini-4-hydrogen', 'gemini-3.8-flash', 'gemini-3.5-flash-lite'];
    let lastError = null;

    for (const model of MODELS) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                      }
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1000
              }
            })
          }
        );

        if (geminiRes.status === 429) {
          lastError = `Rate limited (429) on ${model}`;
          continue; // Try next fallback model
        }

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          lastError = `Model ${model} returned ${geminiRes.status}: ${errText}`;
          continue; // Try next fallback model
        }

        const data = await geminiRes.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(cleanedText);

        const prob = typeof parsed.deepfake_probability === 'number' ? parsed.deepfake_probability : 0.5;
        const verdict = parsed.verdict || (prob > 0.65 ? 'Potentially Manipulated' : (prob > 0.35 ? 'Suspicious' : 'Likely Authentic'));
        const confidence = parsed.confidence || Math.round(prob * 100);
        const findings = Array.isArray(parsed.forensic_findings) ? parsed.forensic_findings : (parsed.evidence_points || []);
        const regions = Array.isArray(parsed.artifact_regions) ? parsed.artifact_regions : [];

        return res.status(200).json({
          fallback: false,
          deepfake_probability: prob,
          verdict: verdict,
          confidence: confidence,
          forensic_findings: findings,
          artifact_regions: regions,
          breakdown: parsed.breakdown || {
            boundary_blending: prob,
            corneal_reflections: prob,
            lighting_consistency: prob,
            texture_artifacts: prob
          },
          reasoning: parsed.reasoning || 'Multimodal vision forensic inspection completed.',
          engine: `Gemini Vision (${model})`,
          layer2_active: true
        });

      } catch (modelErr) {
        lastError = modelErr.message;
        continue;
      }
    }

    // Zero-Crash Graceful Fallback: All models rate limited or unavailable -> Return HTTP 200 with fallback: true
    return res.status(200).json({
      fallback: true,
      reason: lastError || 'Gemini API models rate limited or unavailable',
      engine: 'Client-Side Forensics Engine'
    });

  } catch (err) {
    // Top-level catch: Always return HTTP 200 with fallback: true so frontend never breaks
    return res.status(200).json({
      fallback: true,
      reason: err.message,
      engine: 'Client-Side Forensics Engine'
    });
  }
}
