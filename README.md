# En Blanco

> RPG tactico narrativo cooperativo de terror psicologico.

## Datos Academicos

- **Estudiante:** Adrián Ignacio Coello Santana
- **Codigo U:** 77258
- **Universidad:** Universidad Privada Boliviana (UPB)
- **Materia:** Certificacion
- **Docente:** Ing. Hernan Payrumani
- **Evaluacion:** Examen final, 16 de septiembre de 2026

## Descripcion

En Blanco ocurre dentro de una mente fragmentada despues de siete dias perdidos. Dos jugadores comparten una misma psique desde perspectivas diferentes:

- **La Razon:** analiza pistas, resuelve candados y abre rutas logicas con `WASD`.
- **La Emocion:** recupera recuerdos, activa interruptores y enfrenta el trauma con las flechas.

La Sombra de Trauma se mueve bajo reglas calculadas por Express. Cada accion modifica el estado autoritativo del servidor y React representa el resultado en una pantalla dividida.

## Como Jugar

1. Selecciona **Comenzar Historia**.
2. Lee la introduccion y presiona `ENTER`.
3. Mueve La Razon con `W`, `A`, `S`, `D`.
4. Mueve La Emocion con las flechas.
5. Usa `Q` para distraer a la Sombra desde La Razon o `ENTER` desde La Emocion.
6. Coopera: La Razon consigue llaves y La Emocion activa interruptores.
7. Recupera recuerdos alternando roles hasta alcanzar el 100%.
8. Avanza las cinematicas con `ESPACIO`.

## Reglas Y Estados

- El tablero tiene dos mapas paralelos de 7x7.
- Las paredes bloquean movimientos ilegales.
- Las barreras cooperativas requieren una llave logica o un interruptor emocional.
- La Sombra persigue al jugador mas cercano y puede ser distraida durante dos turnos.
- La cordura global inicia en 100 HP y la derrota ocurre al llegar a 0.
- La victoria ocurre cuando la memoria recuperada llega al 100%.
- El servidor controla posiciones, mapas, cordura, progresion, recuerdos, enemigo y finales.
- Cada partida se reinicia mediante `POST /api/game/reset`.
- Cada reinicio varia la posicion inicial transitable de la Sombra, mientras conserva las posiciones iniciales de los dos roles para mantener controles claros.

## Arquitectura

```text
apps/
  client/                 React + TypeScript + Vite
    public/avatars/       Retratos PNG
    public/sprites/       Hojas de sprites 4x4
    public/images/        Escenas de recuerdos
    public/cinematics/    Escenas de victoria y derrota
    src/App.tsx           Flujo de pantallas y controles
    src/components/       Renderer de escenas y avatares
    src/utils/audio.ts    Web Audio API nativa
  server/                 Express + TypeScript
    src/gameState.ts      Estado y reglas autoritativas
    src/index.ts          API y servidor de archivos estaticos
packages/
  shared/                 Tipos compartidos entre cliente y servidor
```

Express sirve `apps/client/dist` y la API desde el mismo dominio y puerto en produccion.

## API REST

### `GET /api/game/state`

Devuelve el `GameState` actual en JSON, incluyendo posiciones, matrices, cordura, progreso, logs, Sombra y resultado.

### `POST /api/game/action`

Valida una intencion de movimiento o distraccion en el servidor.

```json
{
  "role": "reason",
  "actionType": "move",
  "direction": "right"
}
```

```json
{
  "role": "emotion",
  "actionType": "distract"
}
```

### `POST /api/game/reset`

Reinicia la partida y devuelve un nuevo estado inicial.

Todos los endpoints responden JSON y el cliente se comunica exclusivamente con `fetch` nativo.

## Instalacion Y Comandos

Requisitos: Node.js 20 o superior y npm.

```bash
npm install
npm run build
npm run dev
```

La aplicacion queda disponible en `http://localhost:3000` mediante Express. Para desarrollo con recarga de Vite, ejecuta el servidor y el cliente en terminales separadas:

```bash
npm run dev:client
npm run dev:server
```

Comandos de calidad:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Para ver Playwright en Chrome:

```bash
npx playwright test --headed
```

## Audio Y Assets

El audio se genera sin librerias externas con Web Audio API: musica ambiental, pasos, enemigo, lluvia, choque, cristales y blips sincronizados con el typewriter.

Los assets visuales se sirven desde `apps/client/public/`. Las hojas de sprites se recortan por CSS para mostrar un frame por casilla, y las escenas cinematicas tienen fallback SVG procedural.

## Tests E2E

Playwright cubre:

- Carga del menu principal.
- Pantalla de controles.
- Inicio de la historia y cinematica introductoria.
- Render de los dos roles en pantalla dividida.
- Comunicacion de movimiento con Express mediante `fetch`.
- Validacion de movimiento ilegal contra el borde del tablero.
- Apertura de una cinematica de memoria y avance de sus pasos.

## CI/CD

Los workflows de `.github/workflows/` son independientes:

- `linter.yml`: instala dependencias y ejecuta lint y TypeScript.
- `e2e.yml`: instala Chromium y ejecuta Playwright headless.
- `deploy.yml`: construye la imagen Docker y dispara Render mediante `RENDER_DEPLOY_HOOK_URL` cuando el secreto esta configurado.

## Docker Y Render

```bash
docker build -t en-blanco .
docker run --rm -p 3000:3000 en-blanco
```

Variables:

- `PORT`: puerto de Express, por defecto `3000`.
- `NODE_ENV`: `production` en el contenedor.
- `RENDER_DEPLOY_HOOK_URL`: secreto opcional de GitHub Actions para activar el deploy.

El blueprint de Render esta en `render.yaml`. La aplicacion publicada esta disponible en `https://en-blanco.onrender.com` y su health check JSON en `https://en-blanco.onrender.com/api/game/state`.

## Documentacion Y Defensa

- `docs/introduccion.md`: concepto y experiencia.
- `docs/reglas.md`: controles, estados, cooperacion y finales.
- `docs/api.md`: contrato HTTP JSON.
- `docs/decisiones.md`: arquitectura, restricciones, riesgos y uso de IA.
- `docs/investigacion.md`: Playwright, CI/CD, Docker, Render y audio.

Para la defensa se recomienda mostrar: menu, controles, movimiento de ambos roles, una respuesta JSON de `/api/game/action`, una accion invalida, la prueba Playwright y el workflow de GitHub Actions.

## Matriz De Cumplimiento

| Seccion de la rubrica | Evidencia en el proyecto |
| --- | --- |
| Reglas y experiencia jugable | `docs/reglas.md`, menu, controles, decisiones y finales |
| Interaccion y movimiento | Dos roles, mapas paralelos, llaves, interruptores y Sombra movil |
| React y TypeScript | `apps/client/src/App.tsx`, componentes React y tipos estrictos |
| Express y TypeScript | `apps/server/src/index.ts` y `apps/server/src/gameState.ts` |
| Integracion HTTP REST | `fetch` hacia los tres endpoints JSON |
| GitHub Actions y linting | `linter.yml`, `e2e.yml` y `deploy.yml` |
| Pruebas E2E | Playwright headless y comando `npx playwright test --headed` |
| Publicacion | Dockerfile, `render.yaml` y workflow de deploy |
| Repositorio y documentacion | Este README y cinco documentos en `docs/` |
| Defensa y modificacion | Arquitectura explicable, comandos y flujo de demostracion documentado |

## Repositorio

`https://github.com/AdrianCoello/en-blanco`

## Aplicacion Publicada

`https://en-blanco.onrender.com`

## Video De Demostracion

La evidencia audiovisual de la defensa está documentada aquí:

[`docs/video-demo.md`](docs/video-demo.md)

## Uso Responsable De IA

Se utilizo IA como asistencia para explorar errores, proponer componentes, generar pruebas y revisar documentacion. El registro de decisiones y verificaciones esta en `docs/decisiones.md`. El estudiante debe poder explicar y modificar cada parte del proyecto durante la defensa.
