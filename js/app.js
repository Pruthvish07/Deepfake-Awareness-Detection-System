/**
 * Dual-Mode Application Controller & UI State Engine
 * Deepfake Awareness & Detection System
 */

let heatmapVisible = true;
let quizScore = 0;
const answeredQuestions = { 1: false, 2: false };

document.addEventListener('DOMContentLoaded', () => {
  setupDragAndDrop();
  loadSampleCase('fake');
});

function switchTab(tabId) {
  const tabs = ['scanner', 'awareness', 'evaluator', 'team'];
  tabs.forEach(t => {
    const el = document.getElementById('view' + capitalize(t));
    const btn = document.getElementById('tabBtn' + capitalize(t));
    if (el) el.classList.add('hidden');
    if (btn) btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition';
  });

  const activeEl = document.getElementById('view' + capitalize(tabId));
  const activeBtn = document.getElementById('tabBtn' + capitalize(tabId));
  if (activeEl) activeEl.classList.remove('hidden');
  if (activeBtn) activeBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 text-black shadow-sm transition';
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toggleHeatmap() {
  heatmapVisible = !heatmapVisible;
  const canvas = document.getElementById('customHeatmapCanvas');
  const svgLayer = document.getElementById('svgHeatmapLayer');
  const dot = document.getElementById('dotIndicator');
  const lbl = document.getElementById('lblHeatmap');

  if (heatmapVisible) {
    if (canvas) canvas.style.display = 'block';
    if (svgLayer) svgLayer.style.display = 'block';
    if (dot) dot.className = 'w-2 h-2 rounded-full bg-rose-500';
    if (lbl) lbl.innerText = 'Grad-CAM Heatmap: ON';
  } else {
    if (canvas) canvas.style.display = 'none';
    if (svgLayer) svgLayer.style.display = 'none';
    if (dot) dot.className = 'w-2 h-2 rounded-full bg-slate-500';
    if (lbl) lbl.innerText = 'Grad-CAM Heatmap: OFF';
  }
}

function changeOpacity(val) {
  const canvas = document.getElementById('customHeatmapCanvas');
  if (canvas) canvas.style.opacity = val / 100;
}

function setupDragAndDrop() {
  const dropArea = document.getElementById('dropArea');
  if (!dropArea) return;

  ['dragenter', 'dragover'].forEach(n => {
    dropArea.addEventListener(n, (e) => {
      e.preventDefault();
      dropArea.classList.add('border-cyan-400', 'bg-cyan-950/20');
    });
  });

  ['dragleave', 'drop'].forEach(n => {
    dropArea.addEventListener(n, (e) => {
      e.preventDefault();
      dropArea.classList.remove('border-cyan-400', 'bg-cyan-950/20');
    });
  });

  dropArea.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files[0]) {
      handleUserUpload({ target: { files: e.dataTransfer.files } });
    }
  });
}

async function handleUserUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const badge = document.getElementById('scanStatusBadge');
  if (badge) {
    badge.innerText = 'LAYER 1: PIXEL SCANNING...';
    badge.className = 'text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse';
  }

  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64Data = e.target.result;
    const imgEl = document.getElementById('customUploadedImg');
    const svgEl = document.getElementById('svgViewport');
    const canvas = document.getElementById('customHeatmapCanvas');

    imgEl.src = base64Data;
    imgEl.classList.remove('hidden');
    svgEl.classList.add('hidden');
    canvas.classList.remove('hidden');

    const tempImg = new Image();
    tempImg.onload = async function() {
      // 1. Execute Feature Layer 1: Client Canvas Forensics
      const offCanvas = document.createElement('canvas');
      offCanvas.width = tempImg.width;
      offCanvas.height = tempImg.height;
      const offCtx = offCanvas.getContext('2d');
      offCtx.drawImage(tempImg, 0, 0);

      const imgData = offCtx.getImageData(0, 0, tempImg.width, tempImg.height);
      const layer1 = ForensicAnalyzer.analyzeLayer1(imgData, file.name);

      // Render initial Grad-CAM heatmap overlay
      canvas.width = tempImg.width;
      canvas.height = tempImg.height;
      ForensicAnalyzer.drawGradCAM(canvas, layer1.layer1_score);

      if (badge) {
        badge.innerText = 'LAYER 2: AI REASONING...';
        badge.className = 'text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 animate-pulse';
      }

      // 2. Execute Feature Layer 2: AI Deepfake Multimodal Reasoning
      const layer2 = await ForensicAnalyzer.analyzeLayer2(base64Data, file.name);

      // 3. Dual-Mode Synthesis Fusion
      const composite = ForensicAnalyzer.fuseLayers(layer1, layer2);

      // Redraw Grad-CAM with final fused risk score
      ForensicAnalyzer.drawGradCAM(canvas, composite.risk_score);

      // Render Assessment on Dashboard
      renderAssessment(composite);

      if (badge) {
        badge.innerText = `DUAL-MODE VERIFIED (${layer2.engine.split(' ')[0]})`;
        badge.className = composite.risk_score > 0.5 
          ? 'text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800'
          : 'text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800';
      }
    };
    tempImg.src = base64Data;
  };
  reader.readAsDataURL(file);
}

function loadSampleCase(type) {
  const imgEl = document.getElementById('customUploadedImg');
  const svgEl = document.getElementById('svgViewport');
  const canvas = document.getElementById('customHeatmapCanvas');
  const svgLayer = document.getElementById('svgHeatmapLayer');
  const badge = document.getElementById('scanStatusBadge');

  imgEl.classList.add('hidden');
  canvas.classList.add('hidden');
  svgEl.classList.remove('hidden');

  if (type === 'fake') {
    renderAssessment({
      verdict: 'Potentially Manipulated',
      risk_score: 0.88,
      confidence_percentage: 88,
      layer1_score: 0.84,
      layer2_score: 0.90,
      engine: 'AI Deepfake Reasoning Layer',
      reasoning: 'Facial boundary blending distortion and mismatched corneal catchlights suggest synthetic manipulation.',
      breakdown: { boundary_blending: 0.88, corneal_reflections: 0.84, lighting_consistency: 0.76, texture_artifacts: 0.92 },
      metrics: { visual_risk: 0.88, laplacian_variance: 54.2, lighting_symmetry: 41, ela_variance: 18.4, gradient_magnitude: 86.4 },
      cues: [
        'Facial boundary blending distortion along jawline and hairline perimeter',
        'Corneal eye reflections show mismatched catchlight illumination sources',
        'Error Level Analysis (ELA) detected 8x8 DCT compression anomalies',
        'Skin texture exhibits unnatural low-pass Gaussian smoothing'
      ]
    });
    if (svgLayer) svgLayer.style.display = 'block';
    if (badge) {
      badge.innerText = 'SAMPLE: MANIPULATED MEDIA';
      badge.className = 'text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/80';
    }
  } else {
    renderAssessment({
      verdict: 'Likely Authentic',
      risk_score: 0.12,
      confidence_percentage: 12,
      layer1_score: 0.14,
      layer2_score: 0.10,
      engine: 'AI Deepfake Reasoning Layer',
      reasoning: 'Biological biometric proportions and optical sensor noise harmonics align with authentic media.',
      breakdown: { boundary_blending: 0.12, corneal_reflections: 0.15, lighting_consistency: 0.11, texture_artifacts: 0.10 },
      metrics: { visual_risk: 0.11, laplacian_variance: 248.5, lighting_symmetry: 89, ela_variance: 42.1, gradient_magnitude: 18.2 },
      cues: [
        'Natural discrete Laplacian frequency variance (Balanced photo-sensor noise)',
        'Corneal highlights consistent with singular illumination vector',
        'No synthetic seam boundary distortions or ELA anomalies detected'
      ]
    });
    if (svgLayer) svgLayer.style.display = 'none';
    if (badge) {
      badge.innerText = 'SAMPLE: AUTHENTIC MEDIA';
      badge.className = 'text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80';
    }
  }
}

function renderAssessment(data) {
  const box = document.getElementById('verdictBoxLarge');
  const title = document.getElementById('txtVerdictTitle');
  const desc = document.getElementById('txtVerdictDesc');
  const score = document.getElementById('txtVerdictScore');
  const engineBadge = document.getElementById('lblEngineBadge');

  if (title) title.innerText = data.verdict;
  if (desc) desc.innerText = data.reasoning || data.recommendation;
  if (score) score.innerText = data.confidence_percentage + '%';
  if (engineBadge && data.engine) engineBadge.innerText = data.engine;

  if (data.verdict === 'Potentially Manipulated') {
    if (box) box.className = 'panel rounded-xl p-5 border-l-4 border-l-rose-500 glow-rose transition-all';
    if (title) title.className = 'text-2xl font-black text-rose-400 mt-1';
    if (score) score.className = 'text-4xl font-black text-rose-400 mono';
  } else if (data.verdict === 'Likely Authentic') {
    if (box) box.className = 'panel rounded-xl p-5 border-l-4 border-l-emerald-500 glow-emerald transition-all';
    if (title) title.className = 'text-2xl font-black text-emerald-400 mt-1';
    if (score) score.className = 'text-4xl font-black text-emerald-400 mono';
  } else {
    if (box) box.className = 'panel rounded-xl p-5 border-l-4 border-l-amber-500 glow-amber transition-all';
    if (title) title.className = 'text-2xl font-black text-amber-400 mt-1';
    if (score) score.className = 'text-4xl font-black text-amber-400 mono';
  }

  // Feature Metric Tiles
  const vEdge = document.getElementById('valEdge');
  const vTex = document.getElementById('valTexture');
  const vLight = document.getElementById('valLighting');
  const vEla = document.getElementById('valEla');

  if (vEdge) vEdge.innerText = Math.round((data.breakdown?.boundary_blending || 0.8) * 100) + '%';
  if (vTex) vTex.innerText = data.metrics.laplacian_variance;
  if (vLight) vLight.innerText = Math.round(data.metrics.lighting_symmetry) + '%';
  if (vEla) vEla.innerText = data.metrics.ela_variance || '32.1';

  // Dual-Layer Progress Bars
  const l1Val = document.getElementById('valLayer1');
  const l1Bar = document.getElementById('barLayer1');
  const l2Val = document.getElementById('valLayer2');
  const l2Bar = document.getElementById('barLayer2');

  const l1Score = Math.round((data.layer1_score || data.risk_score) * 100);
  const l2Score = Math.round((data.layer2_score || data.risk_score) * 100);

  if (l1Val) l1Val.innerText = l1Score + '%';
  if (l1Bar) l1Bar.style.width = l1Score + '%';
  if (l2Val) l2Val.innerText = l2Score + '%';
  if (l2Bar) l2Bar.style.width = l2Score + '%';

  // Render Cues
  const cuesBox = document.getElementById('cuesList');
  if (cuesBox && data.cues) {
    cuesBox.innerHTML = '';
    data.cues.forEach(c => {
      const p = document.createElement('p');
      p.className = data.risk_score > 0.4 ? 'text-rose-300 font-medium' : 'text-emerald-300 font-medium';
      p.innerText = '• ' + c;
      cuesBox.appendChild(p);
    });
  }
}

function answerQuiz(qNum, isCorrect) {
  if (answeredQuestions[qNum]) return;
  answeredQuestions[qNum] = true;

  const fb = document.getElementById('q' + qNum + 'Feedback');
  if (!fb) return;
  fb.classList.remove('hidden');

  if (isCorrect) {
    quizScore++;
    fb.className = "text-[11px] p-2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-medium";
    fb.innerHTML = "✅ <strong>Correct!</strong> Exactly right.";
  } else {
    fb.className = "text-[11px] p-2 rounded bg-rose-950/80 text-rose-300 border border-rose-800 font-medium";
    fb.innerHTML = "❌ <strong>Incorrect.</strong> Review the 5-point verification checklist on the left.";
  }

  const scoreBadge = document.getElementById('quizScoreBadge');
  if (scoreBadge) scoreBadge.innerText = "Score: " + quizScore + " / 2";
}
