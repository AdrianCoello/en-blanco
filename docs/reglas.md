# Reglas

## Roles

- La Razon se controla con `WASD` y representa el pensamiento analitico.
- La Emocion se controla con las flechas de direccion y representa la respuesta afectiva al trauma.
- Ambos roles existen en mapas paralelos de 7x7 que comparten una amenaza comun: la Sombra de Trauma.

## Controles

- `W`: mover La Razon hacia arriba.
- `A`: mover La Razon hacia la izquierda.
- `S`: mover La Razon hacia abajo.
- `D`: mover La Razon hacia la derecha.
- `ArrowUp`: mover La Emocion hacia arriba.
- `ArrowLeft`: mover La Emocion hacia la izquierda.
- `ArrowDown`: mover La Emocion hacia abajo.
- `ArrowRight`: mover La Emocion hacia la derecha.
- `ENTER`: omitir la cinematica introductoria.
- `ESPACIO`: avanzar entre los ultimos mensajes narrativos.

El cliente aplica un cooldown de 250 ms por combinacion de rol y direccion para evitar spam de peticiones si se mantiene una tecla presionada.

## Tilemap

- `0`: suelo caminable.
- `1`: pared u obstaculo no transitable.
- `2`: pista o recuerdo que incrementa la memoria recuperada.
- `3`: candado para La Razon o trauma para La Emocion.

## Estado Autoritativo

El backend valida todas las acciones. El frontend no decide si una jugada es legal; solo envia la intencion de movimiento a Express mediante `fetch`.

El servidor mantiene en memoria:

- Cordura global (`sanity`).
- Progreso de memoria recuperada (`memoryProgress`).
- Posicion de La Razon.
- Posicion de La Emocion.
- Posicion de la Sombra de Trauma.
- Matrices de mapa de ambos roles.
- Registro narrativo (`logs`).
- Estado de victoria o derrota.

## Sombra De Trauma

Despues de cada movimiento valido, el servidor mueve automaticamente la Sombra hacia el jugador mas cercano. Si alcanza a La Emocion, la cordura baja con mayor intensidad. Si alcanza a La Razon, tambien hay penalizacion, pero menor.

## Victoria Y Derrota

- Victoria: `memoryProgress >= 100`.
- Derrota: `sanity <= 0`.
- Al llegar a victoria o derrota, React cambia `gameStage` a `victory` o `gameover` y muestra una pantalla final.
