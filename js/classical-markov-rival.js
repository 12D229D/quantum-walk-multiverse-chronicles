/**
 * classical-markov-rival.js
 * Classical Random Walk / Markov Chain simulator for real-time race comparison.
 * Advances probability distribution P(t+1) = M * P(t) under transition matrix M:
 * M_uv = 1 / deg(u) if edge (u, v) exists, 0 otherwise.
 * Demonstrates standard diffusion: sigma(t) ~ sqrt(t).
 */

export class ClassicalMarkovRival {
  constructor(graph) {
    this.graph = graph;
    this.numNodes = graph.numNodes;
    this.probs = new Float64Array(this.numNodes);
    this.stepCount = 0;
    this.reset(graph.startNode);
  }

  reset(startNode = 0) {
    this.stepCount = 0;
    this.probs.fill(0.0);
    this.probs[startNode] = 1.0;
  }

  step() {
    const nextProbs = new Float64Array(this.numNodes);

    for (let u = 0; u < this.numNodes; u++) {
      const pU = this.probs[u];
      if (pU < 1e-12) continue;

      const neighbors = this.graph.adjacency[u];
      if (!neighbors || neighbors.length === 0) {
        nextProbs[u] += pU;
        continue;
      }

      const transProb = pU / neighbors.length;
      for (const v of neighbors) {
        nextProbs[v] += transProb;
      }
    }

    this.probs = nextProbs;
    this.stepCount++;
  }

  getProbabilities() {
    return Array.from(this.probs);
  }

  getSpatialSpread() {
    let mean = 0;
    for (let i = 0; i < this.numNodes; i++) {
      mean += this.probs[i] * i;
    }

    let variance = 0;
    for (let i = 0; i < this.numNodes; i++) {
      variance += this.probs[i] * (i - mean) * (i - mean);
    }

    return {
      mean,
      variance,
      stdDev: Math.sqrt(variance)
    };
  }
}
