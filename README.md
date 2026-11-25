# quantum-walk-multiverse-chronicles

> **Juego de Exploración y Rompecabezas sobre Grafos Cuánticos: Caminatas Cuánticas en Tiempo Discreto (DTQW) vs. Cadenas Clásicas de Markov.**  
> *Compara la propagación balística ($\sigma \propto t$) frente a la difusión aleatoria ($\sigma \propto \sqrt{t}$), resolviendo laberintos topológicos y los célebres Árboles Pegados de Childs.*

---

## 📌 Visión General

`quantum-walk-multiverse-chronicles` pone en tus manos la física de las caminatas cuánticas (*Quantum Walks*). Mientras un caminante aleatorio clásico de Markov deambula sin rumbo por el grafo difundiéndose a un ritmo cuadráticamente inferior ($\sigma(t) \propto \sqrt{t}$), el caminante cuántico aprovecha una **Moneda Cuántica** (Hadamard, Grover o Moneda de Fase) en el espacio extendido $\mathcal{H}_{\text{coin}} \otimes \mathcal{H}_{\text{position}}$ para propagarse de forma **balística** ($\sigma(t) \propto t$).

En laberintos complejos como los **Árboles Pegados de Childs (*Glued Binary Trees*)**, cualquier algoritmo clásico requiere un tiempo exponencial para encontrar la salida; en cambio, la interferencia constructiva cuántica permite cruzar el laberinto en tiempo polinomial.

---

## 🚀 Características Principales

1. **Topologías de Laberintos Multiversales (`js/multiverse-labyrinths.js`):**
   - **Línea 1D:** Verificación visual de los lóbulos balísticos laterales vs. la campana de Gauss clásica.
   - **Anillo $C_{16}$:** Interferencia constructiva en el nodo antipodal.
   - **Hipercubo $Q_3$:** Superposición en las 8 esquinas del cubo tridimensional.
   - **Árboles Pegados de Childs:** Demostración de ventaja cuántica exponencial sobre grafos pegados.
2. **Motor Cuántico Tensorial (`js/quantum-walk-engine.js`):**
   - Espacio de estados complejos $\mathbb{C}^2 \otimes \mathbb{C}^{|V|}$.
   - Monedas: Hadamard ($H$), Difusión de Grover ($2|s\rangle\langle s| - I$), y Moneda Balanceada.
   - Balizas de fase interactivas ($e^{i\phi}$) colocadas por el usuario al hacer clic en los vértices del grafo.
3. **Simulador Rival Clásico de Markov (`js/classical-markov-rival.js`):**
   - Cadena de Markov clásica $P(t+1) = \mathbf{M} P(t)$ ejecutada en paralelo.
4. **Exportador OpenQASM 3.0 (`js/qasm-walk-bridge.js`):**
   - Generación de circuitos cuánticos con compuertas multicontroladas para compilar a hardware real.
5. **Persistencia SQLite (`js/db.js`):**
   - Registro de laberintos completados, tiempos de impacto (*hitting times*) y factores de aceleración.

---

## 💻 Ejecución Local

```bash
# Servidor HTTP estático simple
python -m http.server 8080
# o
npx serve .
```
Abre tu navegador en `http://localhost:8080` para iniciar la marcha cuántica.
