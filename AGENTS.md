# AGENTS.md - Reglas del Proyecto "En Blanco"

Este documento define las reglas de desarrollo, arquitectura y restricciones obligatorias que todo agente de IA (OpenCode, Cursor, Aider, ChatGPT) debe seguir estrictamente para cumplir con la evaluación académica del proyecto.

## 1. Restricciones Técnicas Absolutas
* **Prohibido el uso de librerías externas de CSS/UI:** No instalar ni usar Tailwind CSS, Bootstrap, Material UI, Shadcn, ni bibliotecas similares[cite: 1]. Usar **CSS puro** o CSS Modules[cite: 1].
* **Prohibido Axios o clientes HTTP externos:** La comunicación entre React y Express debe realizarse exclusivamente mediante la API nativa `fetch`[cite: 1].
* **Prohibido React Router o Redux:** El enrutamiento y el manejo del estado global deben implementarse con React nativo (`useState`, `useContext`, `useReducer`)[cite: 1].
* **Prohibidos motores de juegos o Canvas externos:** Toda la interfaz debe construirse con elementos del DOM nativo (HTML5 + CSS Grid/Flexbox)[cite: 1].
* **Mismo Puerto y Dominio:** Backend en Express debe servir el cliente estático de React en producción[cite: 1].

## 2. Arquitectura y Dominio del Juego ("En Blanco")
* **Concepto:** RPG Táctico Narrativo de Terror Psicológico en pantalla dividida (`100vw`, `100vh`)[cite: 1].
* **Roles:** 
  * **Jugador 1 (La Razón):** Resuelve acertijos lógicos y gestiona anclajes de cordura[cite: 1].
  * **Jugador 2 (La Emoción):** Interactúa con recuerdos distorsionados y esquiva sombras de trauma[cite: 1].
* **Estados Obligatorios del Backend:**
  1. Cordura Global / Salud de la Psique (HP)[cite: 1].
  2. % de Memoria Recuperada / Nivel de Revelación (Progreso)[cite: 1].
  3. Coordenadas $(X, Y)$ de jugadores y entidades móviles (Sombras/Fantasmas)[cite: 1].
  4. Estado Emocional actual (Neutral, Asustado, Iracundo, Melancólico)[cite: 1].

## 3. Endpoints REST API (Express)
Toda la comunicación debe ser JSON bidireccional[cite: 1]:
* `GET /api/game/state`: Retorna la matriz de los mapas, la posición de las Sombras, la Cordura restante y los registros narrativos descubiertos[cite: 1].
* `POST /api/game/action`: Recibe la acción elegida por Razón o Emoción, valida si la jugada es legal en el servidor, mueve las Sombras de trauma y devuelve el estado actualizado[cite: 1].
* `POST /api/game/reset`: Reinicia la partida en un estado inicial aleatorio[cite: 1].

## 4. Requisitos de Código y QA
* **TypeScript estricto:** Frontend y Backend deben estar 100% tipados sin el uso de `any`.
* **Tests E2E con Playwright:** Las pruebas deben cubrir:
  1. Pantalla de inicio / Carga del juego[cite: 1].
  2. Interacción de movimiento / Acción enviada al backend vía fetch[cite: 1].
  3. Validación de acción inválida (ej. mover fuera del tablero o sin puntos de acción)[cite: 1].
  4. Pantalla de victoria/derrota (Cordura en 0 o Memoria al 100%)[cite: 1].
* **GitHub Actions (3 Workflows):**
  1. `.github/workflows/lint.yml`: Validación de Linter para Frontend y Backend[cite: 1].
  2. `.github/workflows/e2e.yml`: Ejecución headless de Playwright[cite: 1].
  3. `.github/workflows/deploy.yml`: Despliegue automático a Render/Docker[cite: 1].

## 5. Documentación requerida en `docs/`
Todo cambio significativo debe documentarse en los archivos Markdown dentro de `docs/`[cite: 1]:
* `docs/introduccion.md`: Propósito, experiencia y concepto del juego[cite: 1].
* `docs/reglas.md`: Definición de turnos, estados, victoria y derrota[cite: 1].
* `docs/api.md`: Contrato de endpoints HTTP REST con ejemplos JSON de entrada y salida[cite: 1].
* `docs/decisiones.md`: Decisiones técnicas, riesgos y registro del uso de IA[cite: 1].
* `docs/investigacion.md`: Configuración de pruebas E2E y despliegue[cite: 1].