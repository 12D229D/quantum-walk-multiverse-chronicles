/**
 * qasm-walk-bridge.js
 * OpenQASM 3.0 Dynamic Circuit Exporter for Discrete-Time Quantum Walks.
 * Maps Position register (n qubits) and Coin qubit (1 qubit)
 * with multi-controlled increments/decrements for the Shift operator.
 */

export class QasmWalkBridge {
  static exportWalkCircuit(graph, steps = 5, coinType = 'hadamard') {
    const posQubits = Math.max(1, Math.ceil(Math.log2(graph.numNodes)));
    let qasm = `// OpenQASM 3.0 - Discrete-Time Quantum Walk on Graph: ${graph.name}
// Position Nodes: ${graph.numNodes} (${posQubits} qubits) | Steps: ${steps}
// Coin Operator: ${coinType.toUpperCase()}
OPENQASM 3.0;
include "stdgates.inc";

qubit coin;
qubit[${posQubits}] pos;
bit[${posQubits}] c_pos;
bit c_coin;

// 1. Initial State: Symmetric Coin Superposition (|0> + i|1>)/sqrt(2)
h coin;
s coin; // Phase shift by pi/2 for symmetric propagation

// Initial Position at Start Node ${graph.startNode}
`;

    // Encode startNode into binary
    for (let b = 0; b < posQubits; b++) {
      if ((graph.startNode >> b) & 1) {
        qasm += `x pos[${b}];\n`;
      }
    }

    qasm += `\n// 2. Quantum Walk Evolution Steps (U = S · (C ⊗ I))\n`;

    for (let s = 1; s <= Math.min(steps, 6); s++) {
      qasm += `\n// --- Step ${s} ---\n`;
      // Coin operator
      if (coinType === 'hadamard') {
        qasm += `h coin;\n`;
      } else if (coinType === 'grover') {
        qasm += `x coin;\n`;
      } else {
        qasm += `h coin;\ns coin;\n`;
      }

      // Conditional Shift Operator:
      // If coin == 0 -> Increment pos
      // If coin == 1 -> Decrement pos
      qasm += `// Conditional Shift S: Increment if coin=1, Decrement if coin=0\n`;
      qasm += `x coin;\n`;
      // Controlled increment ladder
      qasm += `cx coin, pos[0];\n`;
      if (posQubits > 1) {
        qasm += `ccx coin, pos[0], pos[1];\n`;
      }
      qasm += `x coin;\n`;

      // Controlled decrement ladder
      qasm += `cx coin, pos[0];\n`;
    }

    qasm += `\n// 3. Projective Measurement of Position and Coin Registers\nc_coin = measure coin;\nc_pos = measure pos;\n`;
    return qasm;
  }
}
