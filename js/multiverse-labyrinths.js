/**
 * multiverse-labyrinths.js
 * Topological Graph Labyrinths for Discrete and Continuous Quantum Walks.
 * Features 1D Lines, Cycles, 2D Grids, Hypercubes (Q3, Q4), and the famous Childs "Glued Trees"
 * graph where quantum walks achieve an exponential hitting time speedup over classical random walks.
 */

export const LABYRINTHS_DB = [
  {
    id: 'line_1d',
    name: '1. Línea Multiversal 1D',
    type: '1D Line',
    difficulty: 'Fácil',
    description: 'Propagación unidimensional simple. Demuestra el contraste entre la curva Gaussiana clásica diffusive (sigma ~ sqrt(t)) y los picos balísticos cuánticos (sigma ~ t).',
    numNodes: 21,
    startNode: 10,
    targetNode: 20,
    trapNodes: [3],
    coords: Array.from({ length: 21 }, (_, i) => ({
      id: i,
      x: 50 + i * 26,
      y: 120,
      label: `${i - 10}`
    })),
    adjacency: Array.from({ length: 21 }, (_, i) => {
      const neighbors = [];
      if (i > 0) neighbors.push(i - 1);
      if (i < 20) neighbors.push(i + 1);
      return neighbors;
    })
  },

  {
    id: 'ring_cycle',
    name: '2. Anillo de Resonancia Cuántica',
    type: 'Cycle Graph C16',
    difficulty: 'Medio',
    description: 'Grafo cíclico de 16 nodos donde dos paquetes de ondas opuestos interfieren constructivamente en el polo antipodal.',
    numNodes: 16,
    startNode: 0,
    targetNode: 8,
    trapNodes: [4, 12],
    coords: Array.from({ length: 16 }, (_, i) => {
      const angle = (i * 2 * Math.PI) / 16 - Math.PI / 2;
      return {
        id: i,
        x: 300 + Math.cos(angle) * 110,
        y: 130 + Math.sin(angle) * 100,
        label: `${i}`
      };
    }),
    adjacency: Array.from({ length: 16 }, (_, i) => [
      (i - 1 + 16) % 16,
      (i + 1) % 16
    ])
  },

  {
    id: 'hypercube_q3',
    name: '3. Hipercubo Cuántico Q₃ (Cubo 3D)',
    type: 'Hypercube Graph',
    difficulty: 'Avanzado',
    description: 'Vértices binarios {0,1}³. La caminata cuántica explora todas las esquinas del cubo en superposición, alcanzando el nodo antipodal 111 con alta fidelidad.',
    numNodes: 8,
    startNode: 0, // '000'
    targetNode: 7, // '111'
    trapNodes: [3], // '011'
    coords: [
      { id: 0, x: 220, y: 160, label: '000' },
      { id: 1, x: 340, y: 160, label: '001' },
      { id: 2, x: 220, y: 70,  label: '010' },
      { id: 3, x: 340, y: 70,  label: '011' },
      { id: 4, x: 260, y: 190, label: '100' },
      { id: 5, x: 380, y: 190, label: '101' },
      { id: 6, x: 260, y: 100, label: '110' },
      { id: 7, x: 380, y: 100, label: '111' }
    ],
    adjacency: [
      [1, 2, 4], // 000
      [0, 3, 5], // 001
      [0, 3, 6], // 010
      [1, 2, 7], // 011
      [0, 5, 6], // 100
      [1, 4, 7], // 101
      [2, 4, 7], // 110
      [3, 5, 6]  // 111
    ]
  },

  {
    id: 'glued_trees',
    name: '4. Árboles Pegados de Childs (Ventaja Exponencial)',
    type: 'Glued Binary Trees',
    difficulty: 'Maestro',
    description: 'Dos árboles binarios simétricos conectados por un ciclo central aleatorio. Cualquier caminata clásica queda atrapada exponencialmente en el centro; la caminata cuántica atraviesa de ENTRANCE a EXIT en tiempo polinomial O(n).',
    numNodes: 14,
    startNode: 0, // Root Entrada
    targetNode: 13, // Root Salida
    trapNodes: [5, 8],
    coords: [
      // Tree 1 (Left)
      { id: 0, x: 80,  y: 125, label: 'IN' },
      { id: 1, x: 160, y: 80,  label: 'T1' },
      { id: 2, x: 160, y: 170, label: 'T2' },
      { id: 3, x: 240, y: 55,  label: 'C1' },
      { id: 4, x: 240, y: 105, label: 'C2' },
      { id: 5, x: 240, y: 145, label: 'C3' },
      { id: 6, x: 240, y: 195, label: 'C4' },
      // Tree 2 (Right)
      { id: 7, x: 360, y: 55,  label: 'M1' },
      { id: 8, x: 360, y: 105, label: 'M2' },
      { id: 9, x: 360, y: 145, label: 'M3' },
      { id: 10, x: 360, y: 195, label: 'M4' },
      { id: 11, x: 440, y: 80,  label: 'R1' },
      { id: 12, x: 440, y: 170, label: 'R2' },
      { id: 13, x: 520, y: 125, label: 'OUT' }
    ],
    adjacency: [
      [1, 2],       // 0 -> 1,2
      [0, 3, 4],    // 1 -> 0,3,4
      [0, 5, 6],    // 2 -> 0,5,6
      [1, 7, 8],    // 3 -> 1, 7,8
      [1, 8, 9],    // 4 -> 1, 8,9
      [2, 9, 10],   // 5 -> 2, 9,10
      [2, 7, 10],   // 6 -> 2, 7,10
      [3, 6, 11],   // 7 -> 3,6, 11
      [3, 4, 11],   // 8 -> 3,4, 11
      [4, 5, 12],   // 9 -> 4,5, 12
      [5, 6, 12],   // 10 -> 5,6, 12
      [7, 8, 13],   // 11 -> 7,8, 13
      [9, 10, 13],  // 12 -> 9,10, 13
      [11, 12]      // 13 -> 11,12
    ]
  }
];
