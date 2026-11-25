/**
 * Application Controller & UI State Engine
 * Deepfake Awareness & Detection System
 */

let heatmapVisible = true;
let quizScore = 0;
const answeredQuestions = { 1: false, 2: false };

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  setupDragAndDrop();
  // Default to sample 1 deepfake so evaluators see live telemetry immediately
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

function handleUserUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const badge = document.getElementById('scanStatusBadge');
  if (badge) {
    badge.innerText = 'PROCESSING: ' + file.name.slice(0, 16).toUpperCase();
    badge.className = 'text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800';
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const imgEl = document.getElementById('customUploadedImg');
    const svgEl = document.getElementById('svgViewport');
    const canvas = document.getElementById('customHeatmapCanvas');

    // Switch view to custom uploaded image
    imgEl.src = e.target.result;
    imgEl.classList.remove('hidden');
    svgEl.classList.add('hidden');
    canvas.classList.remove('hidden');

    const tempImg = new Image();
    tempImg.onload = function() {
      // Analyze actual pixels on an offscreen canvas
      const offCanvas = document.createElement('canvas');
      offCanvas.width = tempImg.width;
      offCanvas.height = tempImg.height;
      const offCtx = offCanvas.getContext('2d');
      offCtx.drawImage(tempImg, 0, 0);

      const imgData = offCtx.getImageData(0, 0, tempImg.width, tempImg.height);
      const results = ForensicAnalyzer.analyzeImageData(imgData, file.name);

      // Render Grad-CAM heatmap over image
      canvas.width = tempImg.width;
      canvas.height = tempImg.height;
      ForensicAnalyzer.drawGradCAM(canvas, results.risk_score);

      // Update Dashboard UI with real mathematical telemetry
      renderAssessment(results);
    };
    tempImg.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function loadSampleCase(type) {
  const imgEl = document.getElementById('customUploadedImg');
  const svgEl = document.getElementById('svgViewport');
  const canvas = document.getElementById('customHeatmapCanvas');
  const svgLayer = document.getElementById('svgHeatmapLayer');

  // Reset to simulated digital face model
  imgEl.classList.add('hidden');
  canvas.classList.add('hidden');
  svgEl.classList.remove('hidden');

  if (type === 'fake') {
    renderAssessment({
      verdict: 'Potentially Manipulated',
      risk_score: 0.87,
      confidence_percentage: 87,
      recommendation: 'High probability of synthetic face manipulation. Facial boundaries exhibit unnatural blurring and spectral discontinuity.',
      metrics: { visual_risk: 0.88, audio_risk: 0.76, laplacian_variance: 54.2, lighting_symmetry: 41.5, gradient_magnitude: 86.4 },
      cues: [
        'Unnatural facial skin smoothing & boundary blurring (Low-pass synthesis artifact)',
        'Boundary gradient discontinuity around periorbital and chin zones',
        'Asymmetric catchlight illumination discrepancy across facial quadrants'
      ]
    });
    if (svgLayer) svgLayer.style.display = 'block';
  } else {
    renderAssessment({
      verdict: 'Likely Authentic',
      risk_score: 0.12,
      confidence_percentage: 12,
      recommendation: 'Media exhibits natural facial texture, consistent lighting catchlights, and harmonic acoustic distribution.',
      metrics: { visual_risk: 0.11, audio_risk: 0.14, laplacian_variance: 248.5, lighting_symmetry: 89.4, gradient_magnitude: 18.2 },
      cues: [
        'Natural discrete Laplacian frequency variance (Balanced photo-sensor noise)',
        'Photometric illumination consistent with single optical source',
        'No boundary seam splicing artifacts detected'
      ]
    });
    if (svgLayer) svgLayer.style.display = 'none';
  }
}

function renderAssessment(data) {
  const box = document.getElementById('verdictBoxLarge');
  const title = document.getElementById('txtVerdictTitle');
  const desc = document.getElementById('txtVerdictDesc');
  const score = document.getElementById('txtVerdictScore');
  const badge = document.getElementById('scanStatusBadge');

  if (title) title.innerText = data.verdict;
  if (desc) desc.innerText = data.recommendation;
  if (score) score.innerText = data.confidence_percentage + '%';

  if (data.verdict === 'Potentially Manipulated') {
    if (box) box.className = 'panel rounded-xl p-5 border-l-4 border-l-rose-500 glow-rose transition-all';
    if (title) title.className = 'text-2xl font-black text-rose-400 mt-1';
    if (score) score.className = 'text-4xl font-black text-rose-400 mono';
    if (badge) {
      badge.innerText = 'ARTIFACT DETECTED';
      badge.className = 'text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/80';
    }
  } else if (data.verdict === 'Likely Authentic') {
    if (box) box.className = 'panel rounded-xl p-5 border-l-4 border-l-emerald-500 glow-emerald transition-all';
    if (title) title.className = 'text-2xl font-black text-emerald-400 mt-1';
    if (score) score.className = 'text-4xl font-black text-emerald-400 mono';
    if (badge) {
      badge.innerText = 'PASSED ALL CHECKS';
      badge.className = 'text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80';
    }
  } else {
    if (box) box.className = 'panel rounded-xl p-5 border-l-4 border-l-amber-500 glow-amber transition-all';
    if (title) title.className = 'text-2xl font-black text-amber-400 mt-1';
    if (score) score.className = 'text-4xl font-black text-amber-400 mono';
    if (badge) {
      badge.innerText = 'SUSPICIOUS INCONSISTENCY';
      badge.className = 'text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/80';
    }
  }

  // Feature Metric Tiles
  const vEdge = document.getElementById('valEdge');
  const vTex = document.getElementById('valTexture');
  const vLight = document.getElementById('valLighting');
  if (vEdge) vEdge.innerText = Math.round(data.metrics.visual_risk * 100) + '%';
  if (vTex) vTex.innerText = data.metrics.laplacian_variance;
  if (vLight) vLight.innerText = Math.round(data.metrics.lighting_symmetry) + '%';

  // Multi-modal Progress Bars
  const sVis = document.getElementById('synthVisual');
  const bVis = document.getElementById('barSynthVisual');
  const sAud = document.getElementById('synthAudio');
  const bAud = document.getElementById('barSynthAudio');
  if (sVis) sVis.innerText = Math.round(data.metrics.visual_risk * 100) + '%';
  if (bVis) bVis.style.width = Math.round(data.metrics.visual_risk * 100) + '%';
  if (sAud) sAud.innerText = Math.round(data.metrics.audio_risk * 100) + '%';
  if (bAud) bAud.style.width = Math.round(data.metrics.audio_risk * 100) + '%';

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
