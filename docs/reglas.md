# Reglas

## Roles

- La Razon se controla con `WASD` y representa el pensamiento analitico.
- La Emocion se controla con las flechas de direccion y representa la respuesta afectiva al trauma.
- Ambos roles existen en mapas paralelos de 7x7 que comparten una amenaza comun: la Sombra de Trauma.
- Cada reset conserva las posiciones iniciales de los jugadores, pero coloca aleatoriamente a la Sombra en una celda transitable para que las partidas no sean identicas.

## Controles

- `W`: mover La Razon hacia arriba.
- `A`: mover La Razon hacia la izquierda.
- `S`: mover La Razon hacia abajo.
- `D`: mover La Razon hacia la derecha.
- `ArrowUp`: mover La Emocion hacia arriba.
- `ArrowLeft`: mover La Emocion hacia la izquierda.
- `ArrowDown`: mover La Emocion hacia abajo.
- `ArrowRight`: mover La Emocion hacia la derecha.
- `Q`: La Razon usa Grito / Distraccion durante 2 turnos de Sombra.
- `ENTER`: La Emocion usa Grito / Distraccion durante la partida.
- `ENTER`: omitir la cinematica introductoria.
- `ESPACIO`: avanzar entre los ultimos mensajes narrativos.
- Si hay una cinematica de recuerdo activa, `ESPACIO` avanza sus pasos y al final guarda el recuerdo para volver a jugar.

El cliente aplica un cooldown de 250 ms por combinacion de rol y direccion para evitar spam de peticiones si se mantiene una tecla presionada.

El HUD de partida esta concentrado en la esquina superior izquierda y muestra `CORDURA DE LA MENTE`, contador `HP`, bloques retro de vida, `PROGRESO DE MEMORIA` y estado cooperativo.

## Tilemap

- `0`: suelo caminable.
- `1`: pared u obstaculo no transitable.
- `2`: pista o recuerdo que incrementa la memoria recuperada.
- `3`: candado para La Razon o trauma para La Emocion.
- `4`: llave logica que solo aprovecha La Razon.
- `5`: interruptor emocional que solo aprovecha La Emocion.
- `6`: barrera cooperativa bloqueada.

## Estado Autoritativo

El backend valida todas las acciones. El frontend no decide si una jugada es legal; solo envia la intencion de movimiento a Express mediante `fetch`.

El servidor mantiene en memoria:

- Cordura global (`sanity`).
- Progreso de memoria recuperada (`memoryProgress`).
- Posicion de La Razon.
- Posicion de La Emocion.
- Posicion de la Sombra de Trauma.
- Matrices de mapa de ambos roles.
- Llaves de La Razon (`reasonKeys`).
- Interruptor emocional (`emotionSwitches`).
- Estado de puertas y barreras (`doorsLocked`).
- Ultimo rol que registro memoria (`lastMemoryCollectedBy`).
- Bloqueos alternados de memoria (`reasonMemoryLock` y `emotionMemoryLock`).
- Movimiento visual de enemigo (`enemyMoved` y `enemyTargetPosition`).
- Rol capturado en derrota (`defeatedBy`).
- Registro narrativo (`logs`).
- Ultimo recuerdo cinematico validado por el servidor (`lastMemory`).
- Estado de victoria o derrota.

## Objetivo En Pantalla

El banner superior muestra el objetivo activo: `OBJETIVO ACTUAL: La Razon debe descifrar el candado | La Emocion debe recoger el Recuerdo del Dia 3`.

## Cooperacion Cruzada

Cuando La Razon pisa una llave, Express incrementa `reasonKeys` y desbloquea la Puerta de Trauma del tablero de La Emocion.

Cuando La Emocion pisa un interruptor, Express activa `emotionSwitches` y elimina los Muros de Negacion del tablero de La Razon.

Ningun jugador puede atravesar su barrera cooperativa si el otro rol no activo antes el desbloqueo correspondiente. Las acciones invalidas quedan registradas en `logs` con un mensaje explicativo.

Ademas, ningun rol puede acumular dos recuerdos seguidos. Si La Razon registra un recuerdo, `reasonMemoryLock` queda activo hasta que La Emocion registre el suyo. Si La Emocion registra un recuerdo, `emotionMemoryLock` queda activo hasta que La Razon registre el siguiente.

## Sombra De Trauma

Despues de cada movimiento valido, el servidor calcula distancia Manhattan hacia ambos jugadores y mueve la Sombra una casilla hacia el jugador mas cercano. Si un jugador usa Grito / Distraccion, la Sombra prioriza a ese jugador durante los siguientes 2 turnos. La respuesta JSON marca `enemyMoved: true` y `enemyTargetPosition` para animar la casilla final del enemigo.

Si la Sombra alcanza a La Emocion, la cordura baja con mayor intensidad. Si alcanza a La Razon, tambien hay penalizacion, pero menor.

## Narrativa En 3 Actos

- El catalogo contiene seis recuerdos unicos: aula, pasillo, velocimetro, tormenta, diagnostico del choque y espejo/climax. Cada entrada entrega sus propios textos y escenas PNG por coordenada.
- La progresion narrativa pasa del detonante al colapso y finalmente a la verdad integrada; los textos no se repiten entre recuerdos.

Cada recuerdo se diferencia por personaje. La Razon recibe hechos objetivos como hora, velocidad, lluvia y curva del km 12. La Emocion recibe el sentir interno: culpa, miedo, impulso de huida y dolor antes del impacto.

## Victoria Y Derrota

- Victoria: `memoryProgress >= 100`.
- Derrota: `sanity <= 0`, con final diferenciado segun `defeatedBy`.
- Si cae La Razon: `FINAL TRAGICO: PARALISIS POR ANALISIS`.
- Si cae La Emocion: `FINAL TRAGICO: DESBORDAMIENTO DE TRAUMA`.
- Si la memoria llega a 100%, se muestra la cinematica `EN BLANCO - CAPITULO 1 COMPLETADO` y `CAPITULO 2: PROXIMAMENTE`.
- Al llegar a victoria o derrota, React cambia `gameStage` a `victory` o `gameover` y muestra una pantalla final.
