# Guia De Defensa - En Blanco

## Datos Del Estudiante

- **Nombre:** Adrián Ignacio Coello Santana
- **Código U:** 77258
- **Universidad:** Universidad Privada Boliviana
- **Materia:** Certificación
- **Docente:** Ing. Hernán Payrumani
- **Proyecto:** En Blanco

## Objetivo De Esta Guía

Esta guía está escrita para copiarse directamente en Notion. Sirve para preparar la defensa individual, explicar el código sin leerlo completo y grabar el video solicitado de 3 a 5 minutos.

La idea principal que debes repetir durante la defensa es:

> El usuario envía una intención desde React, Express valida y modifica el estado autoritativo, y React representa el nuevo estado.

## Explicación Corta Del Juego

En Blanco es un RPG táctico narrativo cooperativo de terror psicológico. La mente del protagonista está dividida en dos roles:

- **La Razón:** se mueve con `WASD`, busca llaves lógicas y analiza hechos.
- **La Emoción:** se mueve con las flechas, recupera recuerdos y activa interruptores emocionales.
- **La Sombra:** es un enemigo controlado por el backend que persigue al jugador más cercano.

Los dos jugadores comparten cordura, progreso de memoria, puertas, recuerdos y enemigo. La meta es recuperar el 100% de la memoria antes de que la cordura llegue a cero.

## Qué Debes Defender Según La Rúbrica

### 1. Reglas Y Experiencia Jugable

Explicación oral:

> Al iniciar, cada rol aparece en su propio tablero 7x7. La Razón y La Emoción tienen controles distintos y deben colaborar. El servidor valida paredes, barreras, llaves, interruptores, recuerdos y colisiones con La Sombra. La partida termina con victoria al llegar a 100% de memoria o con derrota cuando la cordura llega a 0.

Decisiones estratégicas que puedes mostrar:

- Moverse por una ruta segura o acercarse a la Sombra.
- Usar `Q` o `ENTER` para distraer al enemigo.
- Resolver primero una llave lógica para abrir las puertas del tablero emocional.
- Activar un interruptor emocional para eliminar barreras del tablero de La Razón.
- Alternar los roles al recoger recuerdos porque existe un bloqueo cooperativo.

### 2. Dos Jugadores Y Movimiento

Los dos jugadores están en el mismo dispositivo, pero tienen controles asimétricos:

- La Razón usa `W`, `A`, `S`, `D`.
- La Emoción usa `ArrowUp`, `ArrowLeft`, `ArrowDown`, `ArrowRight`.
- La Razón distrae con `Q`.
- La Emoción distrae con `ENTER`.

La Sombra también se mueve después de cada acción válida. Esto demuestra que existen elementos dinámicos durante la partida.

### 3. Estado No Trivial

El estado compartido incluye más de tres tipos de datos:

- `sanity`: cordura global de 0 a 100.
- `memoryProgress`: memoria recuperada de 0 a 100.
- `reasonPos`: posición de La Razón.
- `emotionPos`: posición de La Emoción.
- `shadowPos`: posición de La Sombra.
- `reasonGrid` y `emotionGrid`: matrices de los mapas.
- `reasonKeys`: cantidad de llaves lógicas.
- `emotionSwitches`: estado del interruptor emocional.
- `doorsLocked`: estado de las barreras cooperativas.
- `lastMemory`: cinematica entregada por el servidor.
- `logs`: historial visible de eventos y errores.
- `gameOver` y `gameWon`: estados finales.

### 4. Backend Significativo

Express no es un servidor decorativo. Decide si una acción es legal, modifica posiciones, mueve La Sombra, calcula colisiones, descuenta cordura, incrementa memoria, registra errores y decide victoria o derrota.

La prueba más fácil de explicar es el movimiento:

1. React detecta una tecla.
2. React crea `{ role, actionType, direction }`.
3. React envía el objeto con `fetch` a `/api/game/action`.
4. Express valida el payload y el destino.
5. Express devuelve un `GameState` JSON.
6. React actualiza la pantalla con ese estado.

### 5. Variabilidad

Cada reset coloca La Sombra aleatoriamente en una celda transitable. Las posiciones de los jugadores siguen siendo claras, `(0,0)` y `(6,6)`, pero la amenaza cambia en cada partida. Además, la Sombra elige su objetivo según la distancia Manhattan y puede ser desviada por una distracción.

### 6. Retroalimentación Visual

El usuario puede ver sin abrir la consola:

- Cordura y bloques de HP.
- Porcentaje de memoria.
- Estado de cooperación.
- Posición de cada jugador en los mapas.
- Posición y animación de La Sombra.
- Mensajes de bloqueo y errores.
- Registro narrativo en `LogPanel`.
- Cinemáticas y pantalla final.

## Arquitectura Del Proyecto

```text
En Blanco/
├── apps/
│   ├── client/
│   │   ├── public/
│   │   │   ├── avatars/       Retratos PNG
│   │   │   ├── sprites/       Hojas PNG 4x4
│   │   │   ├── images/        Recuerdos
│   │   │   └── cinematics/    Victoria y derrota
│   │   └── src/
│   │       ├── App.tsx
│   │       ├── App.css
│   │       ├── components/
│   │       │   ├── PlayerAvatar.tsx
│   │       │   └── SceneRenderer.tsx
│   │       └── utils/audio.ts
│   └── server/
│       └── src/
│           ├── index.ts
│           └── gameState.ts
├── packages/shared/src/index.ts
├── docs/
├── tests/e2e/split-screen.spec.ts
├── Dockerfile
├── render.yaml
└── .github/workflows/
```

## Cómo Buscar Rápido En VS Code

Estos atajos evitan perder tiempo durante la defensa:

- `Ctrl + P`: buscar un archivo por nombre.
- `Ctrl + Shift + O`: buscar una función o símbolo dentro del archivo abierto.
- `Ctrl + F`: buscar texto en el archivo actual.
- `Ctrl + Shift + F`: buscar una función o variable en todo el proyecto.
- `Ctrl + G`: ir directamente a una línea.
- `F12`: ir a la definición de una función o tipo.
- `Alt + Left`: volver a la ubicación anterior.

Búsquedas recomendadas:

| Qué quieres demostrar | Atajo | Texto que debes buscar |
| --- | --- | --- |
| Flujo principal React | `Ctrl + P` | `App.tsx` |
| Punto de entrada React | `Ctrl + P` | `main.tsx` |
| Endpoint del servidor | `Ctrl + P` | `index.ts` dentro de `apps/server/src` |
| Reglas del juego | `Ctrl + P` | `gameState.ts` |
| Componentes de personajes | `Ctrl + P` | `PlayerAvatar.tsx` |
| Escenas de recuerdos | `Ctrl + P` | `SceneRenderer.tsx` |
| Audio | `Ctrl + P` | `audio.ts` |
| E2E | `Ctrl + P` | `split-screen.spec.ts` |
| Acción HTTP | `Ctrl + Shift + F` | `submitAction` |
| Movimiento backend | `Ctrl + Shift + F` | `applyGameAction` |
| Estado inicial | `Ctrl + Shift + F` | `createInitialState` |
| Movimiento enemigo | `Ctrl + Shift + F` | `moveShadow` |
| Finalización | `Ctrl + Shift + F` | `updateEndState` |
| Recuerdos | `Ctrl + Shift + F` | `memoryCatalog` |

## Frontend: Explicación De `App.tsx`

### `App`

Es el componente raíz. Controla la pantalla actual mediante `gameStage`:

- `menu`: pantalla de inicio.
- `controls`: instrucciones.
- `cinematic`: introducción narrativa.
- `playing`: partida.
- `memory`: modal de recuerdo.
- `gameover`: derrota.
- `victory`: victoria.

También conserva `gameState`, errores, recuerdo activo, paso de cinematica, mute, direcciones de los jugadores y dirección de La Sombra.

### `loadGameState`

Hace `GET /api/game/state` al cargar la aplicación. Así React no inventa el estado inicial, sino que recibe el estado de Express.

### `startStory`

Desbloquea el audio, inicia la música ambiental, reproduce el clic, llama a `resetGame` y cambia a la introducción.

### `resetGame`

Hace `POST /api/game/reset`, guarda el nuevo `GameState`, limpia recuerdos activos, reinicia la cinematica y devuelve las direcciones visuales a `down`.

### `handleKeyDown`

Escucha el teclado globalmente. Según la etapa actual:

- `ENTER` salta la introducción.
- `ESPACIO` avanza recuerdos o victoria.
- `Q` envía distracción de La Razón.
- `ENTER` envía distracción de La Emoción durante la partida.
- Las teclas de movimiento buscan su binding en `keyBindings`.

El cliente aplica un cooldown de 250 ms para no enviar cientos de peticiones al mantener una tecla.

### `sendAction`

Construye un payload de movimiento y lo pasa a `submitAction`.

### `sendDistraction`

Construye un payload de distracción y lo pasa a `submitAction`.

### `submitAction`

Es la función más importante del flujo frontend-backend:

1. Guarda el estado anterior.
2. Hace `POST /api/game/action` con JSON.
3. Convierte la respuesta a `GameState`.
4. Actualiza React con `setGameState`.
5. Reproduce sonidos de paso, enemigo o memoria.
6. Actualiza la dirección visual de La Sombra.
7. Abre el modal si el backend devolvió `lastMemory`.

Frase para defender:

> La lógica crítica no está en `submitAction`; esta función solo transporta la intención. La legalidad y el resultado los decide `applyGameAction` en Express.

### `StartScreen`

Muestra el título y dos botones: comenzar historia y ver controles.

### `ControlsScreen`

Explica controles asimétricos de La Razón y La Emoción. Es importante para el requisito de instrucciones visibles.

### `CinematicScreen`

Presenta las tres líneas introductorias y permite saltarlas con `ENTER`.

### `Hud`

Muestra cordura, HP, bloques de vida, progreso, cooperación, mute y reset.

### `LogPanel`

Muestra el último mensaje de `gameState.logs`. Es la evidencia visible de acciones inválidas, bloqueos y eventos narrativos.

### `MemoryCinematicOverlay`

Recibe `lastMemory` del servidor. Muestra título, paso actual, escena, retrato del hablante, texto con typewriter y botón de continuación.

La escena se obtiene con `memory.scenes[step]`. Esto permite que cada paso tenga una imagen asociada y que el frontend no invente recuerdos.

### `EndingScreen`

Usa `defeatedBy` para elegir entre:

- `/cinematics/defeat_reason.png`.
- `/cinematics/defeat_emotion.png`.

También muestra el texto y permite reintentar o volver al menú.

### `VictoryCinematic`

Recorre cuatro pasos:

- El Repaso con `victory_repaso.png`.
- El Cliffhanger con `victory_cliffhanger.png`.
- Corte a negro sin imagen.
- Tarjeta de capítulo sin imagen.

## Tablero Y Sprites

### `PlayerPanel`

Renderiza una matriz 7x7. Cada número de la matriz representa un tipo de celda:

- `0`: suelo.
- `1`: pared.
- `2`: recuerdo u objeto.
- `3`: evento.
- `4`: llave lógica.
- `5`: interruptor emocional.
- `6`: barrera cooperativa.

Para cada coordenada compara la posición de la entidad con `samePosition`. Si coincide con el jugador, renderiza `PlayerAvatar`. Si coincide con La Sombra, renderiza otro `PlayerAvatar` con `role="shadow"`.

### `PlayerAvatar.tsx`

Usa las hojas de sprites PNG sin insertar la hoja completa como imagen visible. El frame se recorta con un `div` y CSS:

- `background-size: 400% 400%`.
- `background-repeat: no-repeat`.
- `image-rendering: pixelated`.
- `background-position` según la dirección.

Rutas probadas:

- Razón: `/sprites/sprite_razon.png`, `/sprites/razon.png`, `/razon.png`, `/avatars/razon.png`.
- Emoción: `/sprites/emocion.png`, `/sprites/sprite_emocion.png`, `/emocion.png`, `/avatars/emocion.png`.
- Sombra: `/sprites/sombra.png`, `/sprites/sprite_sombra.png`, `/sombra.png`, `/avatars/sombra.png`.

Las celdas usan un contenedor Flexbox centrado con `overflow: hidden`, por eso La Sombra no puede desbordarse hacia otra casilla.

### Dirección De Sprites

- Abajo: `0%` vertical.
- Izquierda: `33.333%` vertical.
- Arriba: `66.667%` vertical.
- Derecha: `100%` vertical.

La dirección de cada jugador se actualiza al aceptar una tecla. La Sombra calcula su dirección comparando su posición anterior y nueva.

## Backend: Explicación De `index.ts`

El servidor está en `apps/server/src/index.ts`.

### `express.json`

Permite recibir payloads JSON en las solicitudes POST.

### `GET /api/game/state`

Devuelve `getGameState()` como JSON.

### `POST /api/game/action`

Recibe `request.body`, lo envía a `applyGameAction` y devuelve el estado actualizado.

### `POST /api/game/reset`

Llama a `resetGameState` y devuelve una partida nueva.

### `express.static`

Sirve `apps/client/dist`, incluyendo HTML, CSS, JavaScript, avatares, sprites, escenas y cinematicas.

Esta configuración cumple el requisito de mismo dominio y puerto.

## Backend: Explicación De `gameState.ts`

### `getGameState`

Devuelve una copia del estado actual mediante `cloneState`, evitando exponer directamente las estructuras mutables internas.

### `resetGameState`

Limpia la distracción, crea un nuevo estado y devuelve una copia segura.

### `createInitialState`

Crea la partida con:

- La Razón en `(0,0)`.
- La Emoción en `(6,6)`.
- Cordura en `100`.
- Memoria en `0%`.
- Barreras activas.
- La Sombra en una celda abierta aleatoria.

### `getRandomOpenPosition`

Recorre las dos matrices y selecciona posiciones que no sean paredes ni las posiciones iniciales de jugadores. Esto da variabilidad entre partidas.

### `applyGameAction`

Es la autoridad de las reglas. Su flujo es:

1. Limpia flags de la acción anterior.
2. Rechaza partidas ya terminadas.
3. Valida el payload con `isGameActionRequest`.
4. Procesa distracción o movimiento.
5. Verifica límites del tablero.
6. Rechaza paredes.
7. Rechaza barreras cerradas.
8. Rechaza recuerdos bloqueados por cooperación.
9. Mueve al jugador.
10. Mueve La Sombra.
11. Resuelve colisiones.
12. Evalúa victoria o derrota.
13. Devuelve el estado actualizado.

### `movePlayer`

Actualiza la posición y procesa el contenido de la celda. Puede incrementar memoria, disminuir cordura, activar una llave, activar un interruptor o crear una cinematica.

### `setMemoryCinematic`

Busca la combinación `role:x,y` en `memoryCatalog`. Si existe, copia su ID, título, textos y escenas en `lastMemory`.

El catálogo contiene seis recuerdos únicos:

- `reason:4,0`: discusión en el aula.
- `emotion:3,0`: aislamiento en el pasillo.
- `reason:1,2`: velocímetro y frenado.
- `emotion:4,2`: pánico de la tormenta.
- `reason:5,4`: diagnóstico del choque.
- `emotion:0,4`: espejo y verdad integrada.

### `isMemoryLocked`

Impide que el mismo rol recoja dos recuerdos consecutivos. Obliga a la cooperación.

### `applyAlternatingMemoryLock`

Activa el bloqueo del rol que recogió el recuerdo y libera al otro rol.

### `moveShadow`

Selecciona un objetivo y mueve La Sombra una casilla usando distancia Manhattan. También administra los turnos restantes de una distracción.

### `getShadowTargetRole`

Si existe una distracción, La Sombra persigue al rol distraído. Si no existe, persigue al jugador más cercano.

### `getNextShadowPosition`

Calcula primero el movimiento horizontal o vertical que reduzca la distancia y evita paredes y posiciones inválidas.

### `resolveShadowCollision`

Si La Sombra coincide con La Emoción, resta 25 de cordura. Si coincide con La Razón, resta 10. También registra quién fue derrotado.

### `updateEndState`

Marca `gameWon` si `memoryProgress >= 100` y marca `gameOver` si `sanity <= 0`.

### `isGameActionRequest`

Es un type guard de TypeScript. Comprueba en runtime que el body recibido tenga un rol correcto, una acción válida y dirección cuando corresponde.

### `cloneState`

Copia posiciones, matrices, logs y arrays internos. Esto protege el estado autoritativo.

## Tipos Compartidos

El archivo `packages/shared/src/index.ts` evita duplicar contratos entre cliente y servidor.

Tipos importantes:

- `PlayerRole`: `reason` o `emotion`.
- `Direction`: `up`, `down`, `left`, `right`.
- `Position`: coordenadas `x` e `y`.
- `GameActionRequest`: payload recibido por la API.
- `MemoryCinematic`: ID, título, hablante, textos y escenas.
- `GameState`: estado completo de la partida.

Frase para defender:

> Si el servidor cambia el contrato de `GameState`, TypeScript ayuda a detectar qué partes del cliente deben actualizarse.

## Audio Nativo

El archivo es `apps/client/src/utils/audio.ts`. No usa MP3, Howler ni librerías externas.

### `ensureAudioStarted`

Reanuda `AudioContext` después de la primera interacción del usuario, cumpliendo la política de autoplay del navegador.

### `getAudioContext`

Crea `AudioContext` o usa `webkitAudioContext` como fallback.

### `getMasterGain`

Centraliza el volumen general. El botón mute modifica esta ganancia.

### `startAmbientMusic`

Crea dos osciladores senoidales de 110 Hz y 164 Hz. Los conecta a un filtro `lowpass` de 400 Hz y utiliza ganancia aproximada de 3%.

### `playVoiceBlip`

Genera un tono corto por cada carácter del typewriter. La Razón mantiene frecuencia estable; La Emoción usa variación orgánica.

### `playCarCrashSound`

Combina ruido blanco filtrado con un tono grave de 40 Hz.

### `playRainSound` y `stopRainSound`

Generan y detienen una fuente de ruido filtrada para la escena de carretera.

### `playGlassShatterSound`

Reproduce varios tonos descendentes para simular cristales.

### `playStepSound`, `playMemorySound`, `playEnemySound` y `playClickSound`

Son efectos cortos para movimiento, recuerdos, movimiento enemigo y botones.

## Escenas Y Cinemáticas

### `SceneRenderer.tsx`

Recibe un nombre de escena, prueba las rutas PNG y muestra el primer asset que carga. Si todos fallan, muestra una escena SVG procedural para que la narrativa no se rompa.

### Assets De Recuerdos

- `school_classroom.png`.
- `school_hallway.png`.
- `rain_car.png`.
- `rain_street.png`.
- `crash_detail.png`.
- `mirror_shards.png`.

### Assets De Finales

- `defeat_reason.png`.
- `defeat_emotion.png`.
- `victory_repaso.png`.
- `victory_cliffhanger.png`.

## Guion De Video De 3 A 5 Minutos

Duración recomendada: aproximadamente 4 minutos y 30 segundos.

### 0:00 - 0:20 | Presentación

Muestra el repositorio y di:

> Soy Adrián Ignacio Coello Santana, código U 77258, de la Universidad Privada Boliviana. Presento En Blanco, un RPG táctico narrativo cooperativo construido con React, TypeScript, Express y CSS puro.

Enseña brevemente el README y la estructura del proyecto.

### 0:20 - 0:50 | Menú Y Controles

Abre `http://localhost:3000` o la URL pública cuando esté activa.

Muestra:

- Título `EN BLANCO`.
- Botón `Controles e Instrucciones`.
- WASD para La Razón.
- Flechas para La Emoción.
- `Q` y `ENTER` para distracciones.

Explica que ambos roles juegan en el mismo dispositivo y afectan un estado compartido.

### 0:50 - 1:20 | Inicio Y Pantalla Dividida

Pulsa `Comenzar Historia`, después `ENTER`.

Muestra:

- Los dos tableros 7x7.
- HUD de cordura y memoria.
- Sprites de La Razón, La Emoción y La Sombra.
- Registro narrativo.

Di:

> El backend entrega el estado inicial. La Razón inicia en `(0,0)`, La Emoción en `(6,6)` y La Sombra se genera en una celda transitable.

### 1:20 - 2:00 | Movimiento Y API

Abre DevTools en la pestaña Network o usa una terminal.

En terminal muestra:

```bash
curl http://localhost:3000/api/game/state
```

Luego realiza un movimiento con `S` o `D`. Muestra la solicitud `POST /api/game/action` y explica el JSON:

```json
{
  "role": "reason",
  "actionType": "move",
  "direction": "down"
}
```

Di:

> React no mueve directamente el juego. Envía la intención; Express valida y devuelve la posición nueva, el movimiento de la Sombra y los flags de estado.

### 2:00 - 2:30 | Acción Inválida

Reinicia la partida o vuelve al menú. Desde la posición `(0,0)`, pulsa `A`.

Muestra el `LogPanel` con:

> Accion rechazada: el destino queda fuera del tablero 7x7.

Explica que la acción no mueve al jugador y que el rechazo ocurre en el backend.

### 2:30 - 3:15 | Cooperación Y Recuerdo

Para mostrar el recuerdo de La Razón, desde `(0,0)` realiza esta ruta:

1. Pulsa `S`.
2. Pulsa `D`.
3. Pulsa `S`.

La ruta llega a `(1,2)` y abre `RECUERDO #3: EL VELOCIMETRO`.

Muestra:

- Imagen de carretera.
- Retrato del hablante.
- Typewriter.
- `Paso 1 de 3`.
- Avance con `ESPACIO`.

Explica que `lastMemory` viene del backend y contiene `textSteps` y `scenes`.

### 3:15 - 3:45 | Audio Y Finales

Muestra el botón `🔊`/`🔇` del HUD.

Di:

> El audio se sintetiza con Web Audio API. No hay librerías externas ni archivos de sonido. Hay ambiente, pasos, voz retro, lluvia, choque y cristales.

Si puedes, muestra rápidamente el código de `startAmbientMusic` y `playVoiceBlip` con `Ctrl + Shift + O`.

Menciona que existen `EndingScreen` y `VictoryCinematic` con imágenes cinematográficas.

### 3:45 - 4:15 | Tests Y CI

En terminal ejecuta o muestra resultados previos:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

En GitHub muestra los tres workflows:

- Linter.
- E2E.
- Deploy.

Di que E2E cubre menu, controles, movimiento, petición HTTP, validación inválida y recuerdo.

### 4:15 - 4:30 | Cierre

Muestra el repositorio y di:

> El proyecto cumple la separación de responsabilidades: React representa e interactúa, Express valida y conserva las reglas, los tipos compartidos mantienen el contrato, Playwright verifica el flujo y Docker prepara la publicación.

## Guion De Defensa De 10 Minutos

El examen indica máximo 10 minutos. Prioriza demostración y evita leer archivos completos.

### Minuto 0 a 1

Presentación, nombre, código U, concepto y objetivo.

### Minuto 1 a 3

Menú, controles, inicio y pantalla dividida.

### Minuto 3 a 5

Movimiento, acción inválida y `LogPanel`.

### Minuto 5 a 7

Explicación de `fetch`, endpoints y `applyGameAction`.

### Minuto 7 a 8

Cooperación, Sombra, cordura, progreso y recuerdos.

### Minuto 8 a 9

Tests E2E, lint, typecheck, build y workflows.

### Minuto 9 a 10

Cambio solicitado por el docente. Usa `Ctrl + Shift + F` para encontrar la función, modifica una regla pequeña, ejecuta lint/typecheck/E2E y explica el flujo de CI.

## Preguntas Probables Del Docente

### ¿Por qué el backend es autoritativo?

Porque si el cliente decidiera si un movimiento es legal, el usuario podría modificar el navegador y hacer trampa. Express valida paredes, barreras, recursos, Sombra y finales.

### ¿Por qué no usaste React Router?

El proyecto tiene pocas pantallas y la navegación se controla con `gameStage`, sin una librería externa prohibida.

### ¿Por qué no usaste Axios?

El examen exige comunicación nativa y `fetch` es suficiente para JSON.

### ¿Cómo se comparte el estado entre roles?

El estado vive en Express. Ambos tableros reciben el mismo `GameState`, pero muestran matrices y posiciones diferentes.

### ¿Cómo se mueve La Sombra?

Después de cada acción válida, calcula el jugador más cercano con distancia Manhattan y avanza una casilla evitando paredes. Una distracción cambia temporalmente su objetivo.

### ¿Qué pasa si el usuario intenta atravesar una pared?

`applyGameAction` detecta el valor de celda `1`, no cambia la posición y agrega un mensaje a `logs`. `LogPanel` lo muestra en pantalla.

### ¿Cómo se gana?

Al alcanzar `memoryProgress >= 100`, Express marca `gameWon` y React muestra la cinematica de victoria.

### ¿Cómo se pierde?

Cuando `sanity <= 0`, Express marca `gameOver`, registra `defeatedBy` y React muestra el final correspondiente.

### ¿Cómo demuestras que usaste IA responsablemente?

Muestra `docs/decisiones.md` y explica que la IA ayudó a proponer código y pruebas, pero tú verificaste lint, TypeScript, build, E2E y puedes modificar el código.

## Cambio Solicitado Por El Docente

Procedimiento rápido:

1. Repite el requerimiento en voz alta para confirmar que lo entendiste.
2. Usa `Ctrl + Shift + F` para encontrar la función relacionada.
3. Explica qué archivo vas a modificar y por qué.
4. Aplica el cambio mínimo.
5. Ejecuta `npm run lint`.
6. Ejecuta `npm run typecheck`.
7. Ejecuta `npm run test:e2e`.
8. Muestra el resultado en el navegador.
9. Explica que el push activa los workflows.

Cambios fáciles de demostrar:

- Cambiar un mensaje de `LogPanel`.
- Cambiar el costo de una colisión en `resolveShadowCollision`.
- Cambiar el texto de un recuerdo en `memoryCatalog`.
- Cambiar la etiqueta de un botón en `App.tsx`.

## Publicación Y Estado Real

El repositorio contiene `Dockerfile`, `render.yaml` y `deploy.yml`. El workflow construye la imagen Docker correctamente. Para completar el requisito de URL pública, el servicio Render debe estar creado y el secreto `RENDER_DEPLOY_HOOK_URL` debe existir en GitHub.

No debes afirmar que una URL está publicada si no puedes abrirla durante la defensa. Debes probar la URL en Chrome antes de grabar el video.

## Checklist Antes De Entregar

- [ ] README actualizado con nombre, código U y universidad.
- [ ] `docs/introduccion.md` completo.
- [ ] `docs/reglas.md` completo.
- [ ] `docs/api.md` con endpoints y JSON.
- [ ] `docs/decisiones.md` con decisiones, riesgos y uso de IA.
- [ ] `docs/investigacion.md` con Playwright, Docker y Render.
- [ ] Assets dentro de `apps/client/public/`.
- [ ] `npm run lint` exitoso.
- [ ] `npm run typecheck` exitoso.
- [ ] `npm run build` exitoso.
- [ ] `npm run test:e2e` exitoso.
- [ ] Tres workflows visibles en `.github/workflows/`.
- [ ] URL pública verificada en Chrome.
- [ ] Video entre 3 y 5 minutos.
- [ ] Repositorio actualizado después del último cambio.
- [ ] Puedes explicar y modificar `applyGameAction`.
