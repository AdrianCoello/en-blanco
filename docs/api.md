# API

Toda la comunicacion entre React y Express usa JSON y `fetch` nativo. No se usa Axios ni clientes HTTP externos.

## Modelo GameState

```json
{
  "sanity": 100,
  "memoryProgress": 0,
  "currentTurn": "reason",
  "reasonPos": { "x": 0, "y": 0 },
  "emotionPos": { "x": 6, "y": 6 },
  "shadowPos": { "x": 3, "y": 3 },
  "reasonGrid": [[0, 0, 1, 0, 2, 0, 0]],
  "emotionGrid": [[0, 0, 0, 2, 0, 1, 0]],
  "reasonKeys": 0,
  "emotionSwitches": false,
  "doorsLocked": true,
  "lastMemoryCollectedBy": null,
  "reasonMemoryLock": false,
  "emotionMemoryLock": false,
  "logs": ["La mente despierta en blanco."],
  "lastMemory": null,
  "enemyMoved": false,
  "enemyTargetPosition": { "x": 3, "y": 3 },
  "defeatedBy": null,
  "gameOver": false,
  "gameWon": false
}
```

## GET /api/game/state

Retorna el estado autoritativo actual de la partida.

Respuesta `200`:

```json
{
  "sanity": 100,
  "memoryProgress": 0,
  "currentTurn": "reason",
  "reasonPos": { "x": 0, "y": 0 },
  "emotionPos": { "x": 6, "y": 6 },
  "shadowPos": { "x": 3, "y": 3 },
  "reasonGrid": [
    [0, 0, 1, 0, 2, 0, 0],
    [0, 0, 1, 0, 0, 0, 0]
  ],
  "emotionGrid": [
    [0, 0, 0, 2, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0]
  ],
  "reasonKeys": 0,
  "emotionSwitches": false,
  "doorsLocked": true,
  "lastMemoryCollectedBy": null,
  "reasonMemoryLock": false,
  "emotionMemoryLock": false,
  "logs": ["La mente despierta en blanco. WASD mueve a La Razon; las flechas mueven a La Emocion."],
  "lastMemory": null,
  "enemyMoved": false,
  "enemyTargetPosition": { "x": 3, "y": 3 },
  "defeatedBy": null,
  "gameOver": false,
  "gameWon": false
}
```

## POST /api/game/action

Recibe una intencion de movimiento, valida la accion en el servidor, mueve al jugador, desplaza la Sombra de Trauma y devuelve el estado actualizado.

Body:

```json
{
  "role": "reason",
  "actionType": "move",
  "direction": "right"
}
```

Campos:

- `role`: `reason` o `emotion`.
- `actionType`: `move` o `distract`.
- `direction`: `up`, `down`, `left` o `right`. Es obligatorio solo para `move`.

Body para distraccion:

```json
{
  "role": "emotion",
  "actionType": "distract"
}
```

Respuesta `200`:

```json
{
  "sanity": 100,
  "memoryProgress": 15,
  "currentTurn": "reason",
  "reasonPos": { "x": 1, "y": 0 },
  "emotionPos": { "x": 6, "y": 6 },
  "shadowPos": { "x": 3, "y": 4 },
  "reasonGrid": [[0, 0, 1, 0, 2, 0, 0]],
  "emotionGrid": [[0, 0, 0, 2, 0, 1, 0]],
  "reasonKeys": 0,
  "emotionSwitches": false,
  "doorsLocked": true,
  "lastMemoryCollectedBy": null,
  "reasonMemoryLock": false,
  "emotionMemoryLock": false,
  "logs": ["La Razon avanza a (1, 0)."],
  "lastMemory": null,
  "enemyMoved": true,
  "enemyTargetPosition": { "x": 3, "y": 4 },
  "defeatedBy": null,
  "gameOver": false,
  "gameWon": false
}
```

Si la accion recoge un recuerdo, `lastMemory` contiene los datos de la cinematica que debe mostrar el frontend:

```json
{
  "lastMemory": {
    "id": "memory-4-emotion-rain-street",
    "title": "RECUERDO #4: LA TORMENTA",
    "discoveredBy": "emotion",
    "textSteps": [
      "PERSPECTIVA DE LA EMOCION: La lluvia no caia sobre el parabrisas; caia directamente dentro del pecho.",
      "El impacto fue primero un silencio. Luego todo mi cuerpo entendio el miedo antes que la mente.",
      "No recuerdo haber llorado. Recuerdo no poder respirar mientras las luces rojas parpadeaban en la calle."
    ],
    "scenes": [
      "rain_street",
      "rain_street",
      "rain_street"
    ]
  }
}
```

Cada valor de `scenes` se resuelve en frontend como `/images/<nombre>.png`, por ejemplo `/images/rain_street.png`.

Si la accion es invalida, el servidor no mueve al jugador y agrega un mensaje al registro narrativo. El contrato mantiene respuesta JSON con `GameState` para simplificar el cliente.

Si un jugador intenta recoger dos recuerdos seguidos, el servidor rechaza la acumulacion alternada y registra un mensaje como `La Razon no puede registrar otro recuerdo todavia. Esperando al otro fragmento de la psique.`.

## POST /api/game/reset

Reinicia la partida al estado inicial. Se usa cuando el jugador selecciona `Comenzar Historia` desde el menu principal.

La posicion de `shadowPos` puede variar en cada reset; los valores mostrados son solo un ejemplo de respuesta.

Respuesta `200`:

```json
{
  "sanity": 100,
  "memoryProgress": 0,
  "currentTurn": "reason",
  "reasonPos": { "x": 0, "y": 0 },
  "emotionPos": { "x": 6, "y": 6 },
  "shadowPos": { "x": 3, "y": 3 },
  "reasonGrid": [],
  "emotionGrid": [],
  "reasonKeys": 0,
  "emotionSwitches": false,
  "doorsLocked": true,
  "lastMemoryCollectedBy": null,
  "reasonMemoryLock": false,
  "emotionMemoryLock": false,
  "logs": ["La mente despierta en blanco. WASD mueve a La Razon; las flechas mueven a La Emocion."],
  "lastMemory": null,
  "enemyMoved": false,
  "enemyTargetPosition": { "x": 3, "y": 3 },
  "defeatedBy": null,
  "gameOver": false,
  "gameWon": false
}
```
