/**
 * app.js
 * Main Controller for Quantum Walk: Multiverse Labyrinth Chronicles.
 * Synchronizes Quantum & Classical Walk engines, renders Topologic Graph on Canvas,
 * Phase Beacons, Web Audio synthesizer, and OpenQASM 3.0 export.
 */

import { LABYRINTHS_DB } from './multiverse-labyrinths.js';
import { QuantumWalkEngine } from './quantum-walk-engine.js';
import { ClassicalMarkovRival } from './classical-markov-rival.js';
import { QasmWalkBridge } from './qasm-walk-bridge.js';
import { WalkDatabase } from './db.js';

class QuantumWalkApp {
  constructor() {
    this.db = new WalkDatabase();
    this.currentLabIndex = 0;
    this.isRunning = false;
    this.timer = null;

    this.audioCtx = null;
    this.initDOM();
    this.setupEventListeners();
    this.loadLabyrinth(0);
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.audioCtx = new AudioContext();
    }
  }

  playTone(freq = 440, type = 'sine', duration = 0.12) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  initDOM() {
    this.dom = {
      labSelect: document.getElementById('lab-select'),
      labTitle: document.getElementById('lab-title'),
      labType: document.getElementById('lab-type'),
      labDesc: document.getElementById('lab-desc'),
      coinSelect: document.getElementById('coin-select'),

      // Controls
      btnStep: document.getElementById('btn-step'),
      btnRun: document.getElementById('btn-run'),
      btnReset: document.getElementById('btn-reset'),
      btnShowQasm: document.getElementById('btn-show-qasm'),

      // Meters
      quantumStepsVal: document.getElementById('quantum-steps-val'),
      classicalStepsVal: document.getElementById('classical-steps-val'),
      quantumProbVal: document.getElementById('quantum-prob-val'),
      classicalProbVal: document.getElementById('classical-prob-val'),
      quantumSpreadVal: document.getElementById('quantum-spread-val'),
      classicalSpreadVal: document.getElementById('classical-spread-val'),
      victoryAlert: document.getElementById('victory-alert'),

      // Canvas
      canvasGraph: document.getElementById('canvas-graph'),

      // QASM Modal
      qasmModal: document.getElementById('qasm-modal'),
      qasmContent: document.getElementById('qasm-content'),
      btnCloseQasm: document.getElementById('btn-close-qasm'),
      btnCopyQasm: document.getElementById('btn-copy-qasm')
    };

    // Populate Labyrinth select
    this.dom.labSelect.innerHTML = '';
    const unlocked = this.db.getUnlockedLabyrinths();
    LABYRINTHS_DB.forEach((lab, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      const isLocked = !unlocked.includes(lab.id);
      opt.textContent = `${isLocked ? '🔒 ' : '🗺️ '}${lab.name}`;
      this.dom.labSelect.appendChild(opt);
    });
  }

  setupEventListeners() {
    this.dom.labSelect.addEventListener('change', (e) => {
      this.loadLabyrinth(parseInt(e.target.value, 10));
    });

    this.dom.coinSelect.addEventListener('change', (e) => {
      if (this.quantumEngine) {
        this.quantumEngine.setCoinType(e.target.value);
        this.playTone(550, 'triangle', 0.1);
      }
    });

    this.dom.btnStep.addEventListener('click', () => {
      this.initAudio();
      this.step();
    });

    this.dom.btnRun.addEventListener('click', () => {
      this.initAudio();
      this.toggleRun();
    });

    this.dom.btnReset.addEventListener('click', () => {
      this.resetWalk();
    });

    // Canvas click to add/remove Phase Shifter beacon on node
    this.dom.canvasGraph.addEventListener('click', (e) => {
      this.handleCanvasClick(e);
    });

    this.dom.btnShowQasm.addEventListener('click', () => {
      this.showQasm();
    });
    this.dom.btnCloseQasm.addEventListener('click', () => {
      this.dom.qasmModal.classList.add('hidden');
    });
    this.dom.btnCopyQasm.addEventListener('click', () => {
      navigator.clipboard.writeText(this.dom.qasmContent.textContent);
      this.playTone(880, 'sine', 0.1);
      alert('Circuito OpenQASM 3.0 copiado al portapapeles.');
    });
  }

  loadLabyrinth(index) {
    this.stopRun();
    this.currentLabIndex = index;
    const lab = LABYRINTHS_DB[index];
    this.dom.labTitle.textContent = lab.name;
    this.dom.labType.textContent = `${lab.type} — Dificultad: ${lab.difficulty}`;
    this.dom.labDesc.textContent = lab.description;

    this.quantumEngine = new QuantumWalkEngine(lab);
    this.quantumEngine.setCoinType(this.dom.coinSelect.value);

    this.classicalEngine = new ClassicalMarkovRival(lab);

    this.dom.victoryAlert.classList.add('hidden');
    this.updateStatsUI();
    this.renderGraph();
  }

  resetWalk() {
    this.stopRun();
    const lab = LABYRINTHS_DB[this.currentLabIndex];
    this.quantumEngine.resetState(lab.startNode);
    this.classicalEngine.reset(lab.startNode);
    this.dom.victoryAlert.classList.add('hidden');
    this.updateStatsUI();
    this.renderGraph();
  }

  toggleRun() {
    if (this.isRunning) {
      this.stopRun();
    } else {
      this.isRunning = true;
      this.dom.btnRun.textContent = '⏸️ Pausar Simulación';
      this.dom.btnRun.classList.add('active');
      this.timer = setInterval(() => {
        this.step();
      }, 350);
    }
  }

  stopRun() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.dom.btnRun) {
      this.dom.btnRun.textContent = '▶️ Marcha Continua';
      this.dom.btnRun.classList.remove('active');
    }
  }

  step() {
    const lab = LABYRINTHS_DB[this.currentLabIndex];
    this.quantumEngine.step();
    this.classicalEngine.step();

    this.playTone(300 + (this.quantumEngine.stepCount % 10) * 40, 'sine', 0.08);

    this.updateStatsUI();
    this.renderGraph();
    this.checkVictoryCondition();
  }

  checkVictoryCondition() {
    const lab = LABYRINTHS_DB[this.currentLabIndex];
    const qProbs = this.quantumEngine.getProbabilities();
    const cProbs = this.classicalEngine.getProbabilities();

    const qTargetProb = qProbs[lab.targetNode] || 0;
    const cTargetProb = cProbs[lab.targetNode] || 0;

    // Victory if Quantum achieves >= 15% probability mass on target exit
    if (qTargetProb >= 0.15 && !this.dom.victoryAlert.classList.contains('won')) {
      this.stopRun();
      this.playTone(784, 'triangle', 0.4);

      const speedup = (qTargetProb / Math.max(0.001, cTargetProb)).toFixed(1);
      this.dom.victoryAlert.classList.remove('hidden');
      this.dom.victoryAlert.classList.add('won');
      this.dom.victoryAlert.textContent = `🎉 ¡OBJETIVO ALCANZADO POR ONDA CUÁNTICA! Probabilidad: ${(qTargetProb * 100).toFixed(1)}% vs Clásico: ${(cTargetProb * 100).toFixed(1)}% (Ventaja: ${speedup}x en paso t=${this.quantumEngine.stepCount})`;

      // Unlock next
      const nextIdx = this.currentLabIndex + 1;
      const nextLab = LABYRINTHS_DB[nextIdx];
      this.db.recordLabyrinthVictory({
        labyrinthId: lab.id,
        coinType: this.quantumEngine.coinType,
        quantumSteps: this.quantumEngine.stepCount,
        classicalSteps: this.classicalEngine.stepCount,
        speedup: parseFloat(speedup),
        unlockNext: nextLab ? nextLab.id : null
      });
    }
  }

  updateStatsUI() {
    const lab = LABYRINTHS_DB[this.currentLabIndex];
    const qProbs = this.quantumEngine.getProbabilities();
    const cProbs = this.classicalEngine.getProbabilities();

    this.dom.quantumStepsVal.textContent = this.quantumEngine.stepCount;
    this.dom.classicalStepsVal.textContent = this.classicalEngine.stepCount;

    const qTarget = ((qProbs[lab.targetNode] || 0) * 100).toFixed(1);
    const cTarget = ((cProbs[lab.targetNode] || 0) * 100).toFixed(1);

    this.dom.quantumProbVal.textContent = `${qTarget}%`;
    this.dom.classicalProbVal.textContent = `${cTarget}%`;

    const qSpread = this.quantumEngine.getSpatialSpread();
    const cSpread = this.classicalEngine.getSpatialSpread();

    this.dom.quantumSpreadVal.textContent = `σ = ${qSpread.stdDev.toFixed(2)}`;
    this.dom.classicalSpreadVal.textContent = `σ = ${cSpread.stdDev.toFixed(2)}`;
  }

  handleCanvasClick(e) {
    const rect = this.dom.canvasGraph.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const lab = LABYRINTHS_DB[this.currentLabIndex];
    // Find closest node
    let closest = null;
    let minDist = 25;

    lab.coords.forEach((c) => {
      const dist = Math.hypot(c.x - clickX, c.y - clickY);
      if (dist < minDist) {
        minDist = dist;
        closest = c.id;
      }
    });

    if (closest !== null) {
      // Toggle pi/2 phase shifter
      const currentPhi = this.quantumEngine.phaseShifters.get(closest) || 0;
      const nextPhi = currentPhi === 0 ? Math.PI / 2 : 0;
      this.quantumEngine.setPhaseShifter(closest, nextPhi);
      this.playTone(660, 'sine', 0.1);
      this.renderGraph();
    }
  }

  renderGraph() {
    const canvas = this.dom.canvasGraph;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const lab = LABYRINTHS_DB[this.currentLabIndex];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const qProbs = this.quantumEngine.getProbabilities();
    const cProbs = this.classicalEngine.getProbabilities();
    const phaseHues = this.quantumEngine.getNodePhaseHues();

    // 1. Draw Edges
    ctx.strokeStyle = 'hsla(220, 20%, 35%, 0.4)';
    ctx.lineWidth = 2;
    for (let u = 0; u < lab.numNodes; u++) {
      const uCoord = lab.coords[u];
      const neighbors = lab.adjacency[u] || [];
      for (const v of neighbors) {
        if (v > u) {
          const vCoord = lab.coords[v];
          ctx.beginPath();
          ctx.moveTo(uCoord.x, uCoord.y);
          ctx.lineTo(vCoord.x, vCoord.y);
          ctx.stroke();
        }
      }
    }

    // 2. Draw Nodes
    lab.coords.forEach((coord) => {
      const u = coord.id;
      const qP = qProbs[u] || 0;
      const cP = cProbs[u] || 0;
      const hue = phaseHues[u] || 180;

      const isStart = (u === lab.startNode);
      const isTarget = (u === lab.targetNode);
      const isTrap = lab.trapNodes.includes(u);
      const hasBeacon = this.quantumEngine.phaseShifters.has(u);

      // Node Radius scaled by quantum probability
      const baseR = 12;
      const qRadius = baseR + Math.min(20, qP * 35);

      // Node Glow
      if (qP > 0.02) {
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, qRadius + 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 90%, 50%, ${Math.min(0.6, qP * 1.5)})`;
        ctx.fill();
      }

      // Draw Base Circle
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, baseR, 0, Math.PI * 2);

      if (isStart) {
        ctx.fillStyle = 'hsl(200, 95%, 55%)';
      } else if (isTarget) {
        ctx.fillStyle = 'hsl(45, 100%, 60%)';
      } else if (isTrap) {
        ctx.fillStyle = 'hsl(0, 80%, 55%)';
      } else {
        ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
      }
      ctx.fill();

      // Node border
      ctx.lineWidth = hasBeacon ? 3 : 1.5;
      ctx.strokeStyle = hasBeacon ? 'hsl(45, 100%, 65%)' : '#fff';
      ctx.stroke();

      // Draw Classical Rival Ring indicator (Green outline inside or offset)
      if (cP > 0.05) {
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, baseR + 3, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(150, 90%, 55%, ${Math.min(0.8, cP * 2)})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Node Label
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(coord.label, coord.x, coord.y);

      // Phase beacon indicator
      if (hasBeacon) {
        ctx.fillStyle = 'hsl(45, 100%, 65%)';
        ctx.font = '10px sans-serif';
        ctx.fillText('📡', coord.x + 14, coord.y - 12);
      }
    });
  }

  showQasm() {
    const lab = LABYRINTHS_DB[this.currentLabIndex];
    const qasm = QasmWalkBridge.exportWalkCircuit(lab, this.quantumEngine.stepCount || 5, this.quantumEngine.coinType);
    this.dom.qasmContent.textContent = qasm;
    this.dom.qasmModal.classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new QuantumWalkApp();
});
