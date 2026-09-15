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
  "logs": ["La mente despierta en blanco."],
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
  "logs": ["La mente despierta en blanco. WASD mueve a La Razon; las flechas mueven a La Emocion."],
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
- `actionType`: actualmente `move`.
- `direction`: `up`, `down`, `left` o `right`.

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
  "logs": ["La Sombra de Trauma se desplaza a (3, 4).", "La Razon avanza a (1, 0)."],
  "gameOver": false,
  "gameWon": false
}
```

Si la accion es invalida, el servidor no mueve al jugador y agrega un mensaje al registro narrativo. El contrato mantiene respuesta JSON con `GameState` para simplificar el cliente.

## POST /api/game/reset

Reinicia la partida al estado inicial. Se usa cuando el jugador selecciona `Comenzar Historia` desde el menu principal.

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
  "logs": ["La mente despierta en blanco. WASD mueve a La Razon; las flechas mueven a La Emocion."],
  "gameOver": false,
  "gameWon": false
}
```
