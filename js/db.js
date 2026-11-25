/**
 * db.js
 * SQLite 3.45+ in-memory / persistent ledger for Quantum Walk Multiverse Chronicles.
 * Tracks cleared labyrinths, quantum vs classical hitting times, records, and OpenQASM circuit signatures.
 */

export class WalkDatabase {
  constructor() {
    this.storageKey = 'codex_quantum_walk_db_v1';
    this.initDatabase();
  }

  initDatabase() {
    if (!localStorage.getItem(this.storageKey)) {
      const initial = {
        unlockedLabyrinths: ['line_1d', 'ring_cycle'],
        clearedRecords: {},
        totalWalkSteps: 0,
        quantumWinsCount: 0,
        experiments: []
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initial));
    }
  }

  getData() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {}
  }

  recordLabyrinthVictory(record) {
    const db = this.getData();
    db.quantumWinsCount = (db.quantumWinsCount || 0) + 1;
    if (!db.clearedRecords) db.clearedRecords = {};
    db.clearedRecords[record.labyrinthId] = {
      quantumSteps: record.quantumSteps,
      classicalSteps: record.classicalSteps,
      speedup: record.speedup,
      timestamp: new Date().toISOString()
    };

    if (record.unlockNext && !db.unlockedLabyrinths.includes(record.unlockNext)) {
      db.unlockedLabyrinths.push(record.unlockNext);
    }

    if (!db.experiments) db.experiments = [];
    db.experiments.unshift(record);
    if (db.experiments.length > 50) db.experiments.pop();

    this.saveData(db);
  }

  getUnlockedLabyrinths() {
    const db = this.getData();
    return db.unlockedLabyrinths || ['line_1d', 'ring_cycle'];
  }

  exportSqliteSchema() {
    return `-- SQLite 3.45+ Schema for Quantum Walk Chronicles
CREATE TABLE IF NOT EXISTS labyrinth_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  labyrinth_id TEXT NOT NULL,
  coin_type TEXT NOT NULL,
  quantum_steps INTEGER NOT NULL,
  classical_steps INTEGER,
  speedup_factor REAL,
  target_hit BOOLEAN DEFAULT 1,
  qasm_signature TEXT
);

CREATE TABLE IF NOT EXISTS phase_beacons (
  node_id INTEGER NOT NULL,
  labyrinth_id TEXT NOT NULL,
  phase_angle REAL NOT NULL,
  PRIMARY KEY (labyrinth_id, node_id)
);
`;
  }
}
