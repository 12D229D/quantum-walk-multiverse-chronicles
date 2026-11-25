/**
 * quantum-walk-engine.js
 * Discrete-Time Quantum Walk (DTQW) and Continuous-Time Quantum Walk (CTQW) Engine.
 * Hilbert Space: H_coin (x) H_position
 * Coin operators: Hadamard, Grover Diffusion, Phase-shifted coin, and Kempe permutation coin.
 * Conditional shift operator: S|c>|v> = |c>|v + direction(c)>
 * Phase shifters (Anderson disorder beacons): Phi_v = exp(i * phi_v)
 */

export class QuantumComplex {
  constructor(re = 0, im = 0) {
    this.re = re;
    this.im = im;
  }

  add(c) {
    return new QuantumComplex(this.re + c.re, this.im + c.im);
  }

  sub(c) {
    return new QuantumComplex(this.re - c.re, this.im - c.im);
  }

  mul(c) {
    return new QuantumComplex(
      this.re * c.re - this.im * c.im,
      this.re * c.im + this.im * c.re
    );
  }

  scale(s) {
    return new QuantumComplex(this.re * s, this.im * s);
  }

  magSq() {
    return this.re * this.re + this.im * this.im;
  }

  phase() {
    return Math.atan2(this.im, this.re);
  }
}

export class QuantumWalkEngine {
  constructor(graph) {
    this.graph = graph;
    this.numNodes = graph.numNodes;
    this.coinDegrees = 2; // Default 2 coin states: Left (0) and Right (1)
    this.coinType = 'hadamard'; // 'hadamard' | 'grover' | 'balanced'
    
    // Phase shifters placed by player: map of nodeId -> angle phi in radians
    this.phaseShifters = new Map();

    // State vector: 2D array [nodeId][coinState] of QuantumComplex
    this.state = [];
    this.stepCount = 0;
    this.resetState(graph.startNode);
  }

  setCoinType(type) {
    this.coinType = type;
  }

  setPhaseShifter(nodeId, phi) {
    if (phi === 0) {
      this.phaseShifters.delete(nodeId);
    } else {
      this.phaseShifters.set(nodeId, phi);
    }
  }

  resetState(startNode = 0) {
    this.stepCount = 0;
    this.state = Array.from({ length: this.numNodes }, () => [
      new QuantumComplex(0, 0),
      new QuantumComplex(0, 0)
    ]);

    // Initial symmetric coin state: (|0> + i|1>)/sqrt(2) to break left/right asymmetry
    const invSqrt2 = 1 / Math.SQRT2;
    this.state[startNode][0] = new QuantumComplex(invSqrt2, 0);
    this.state[startNode][1] = new QuantumComplex(0, invSqrt2);
  }

  /**
   * Applies the chosen Coin Operator C on the 2D coin space at every node
   */
  applyCoinOperator() {
    const invSqrt2 = 1 / Math.SQRT2;

    for (let v = 0; v < this.numNodes; v++) {
      const a0 = this.state[v][0];
      const a1 = this.state[v][1];

      let new0, new1;
      if (this.coinType === 'hadamard') {
        // H = [[1, 1], [1, -1]] / sqrt(2)
        new0 = a0.add(a1).scale(invSqrt2);
        new1 = a0.sub(a1).scale(invSqrt2);
      } else if (this.coinType === 'grover') {
        // 2D Grover diffusion: [[0, 1], [1, 0]] or balanced phase shift
        // Standard 2D Grover: X gate or (2/N)*J - I
        new0 = a1;
        new1 = a0;
      } else {
        // Balanced Phase coin: [[1, i], [i, 1]] / sqrt(2)
        const iA1 = new QuantumComplex(-a1.im, a1.re);
        const iA0 = new QuantumComplex(-a0.im, a0.re);
        new0 = a0.add(iA1).scale(invSqrt2);
        new1 = iA0.add(a1).scale(invSqrt2);
      }

      // Apply local Phase Shifter beacon if placed on node v: exp(i * phi)
      if (this.phaseShifters.has(v)) {
        const phi = this.phaseShifters.get(v);
        const phaseFactor = new QuantumComplex(Math.cos(phi), Math.sin(phi));
        new0 = new0.mul(phaseFactor);
        new1 = new1.mul(phaseFactor);
      }

      this.state[v][0] = new0;
      this.state[v][1] = new1;
    }
  }

  /**
   * Applies Shift Operator S:
   * Coin 0 moves toward first half of neighbors / left,
   * Coin 1 moves toward second half / right.
   */
  applyShiftOperator() {
    const nextState = Array.from({ length: this.numNodes }, () => [
      new QuantumComplex(0, 0),
      new QuantumComplex(0, 0)
    ]);

    for (let v = 0; v < this.numNodes; v++) {
      const neighbors = this.graph.adjacency[v];
      if (!neighbors || neighbors.length === 0) continue;

      const nLeft = neighbors[0];
      const nRight = neighbors.length > 1 ? neighbors[neighbors.length - 1] : neighbors[0];

      // Coin 0 shifts to nLeft
      nextState[nLeft][0] = nextState[nLeft][0].add(this.state[v][0]);

      // Coin 1 shifts to nRight
      nextState[nRight][1] = nextState[nRight][1].add(this.state[v][1]);
    }

    this.state = nextState;
  }

  /**
   * Performs 1 full Discrete Quantum Walk step: U = S * (C (x) I)
   */
  step() {
    this.applyCoinOperator();
    this.applyShiftOperator();
    this.stepCount++;
  }

  /**
   * Returns probability distribution over nodes: P(v) = |psi_v,0|^2 + |psi_v,1|^2
   */
  getProbabilities() {
    return this.state.map(([c0, c1]) => c0.magSq() + c1.magSq());
  }

  /**
   * Computes spatial variance sigma^2 and standard deviation sigma(t)
   */
  getSpatialSpread() {
    const probs = this.getProbabilities();
    let mean = 0;
    probs.forEach((p, idx) => mean += p * idx);

    let variance = 0;
    probs.forEach((p, idx) => {
      variance += p * (idx - mean) * (idx - mean);
    });

    return {
      mean,
      variance,
      stdDev: Math.sqrt(variance)
    };
  }

  /**
   * Returns the phase angle (Hue) and magnitude for each node
   */
  getNodePhaseHues() {
    return this.state.map(([c0, c1]) => {
      const netRe = c0.re + c1.re;
      const netIm = c0.im + c1.im;
      const angle = Math.atan2(netIm, netRe); // -pi to +pi
      // Map [-pi, pi] to HSL hue [0, 360]
      const hue = ((angle + Math.PI) / (2 * Math.PI)) * 360;
      return Math.round(hue);
    });
  }
}
