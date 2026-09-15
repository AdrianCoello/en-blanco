# Decisiones

## Arquitectura

- Se uso monorepo con npm workspaces para separar `apps/client`, `apps/server` y `packages/shared`.
- `packages/shared` contiene los tipos TypeScript usados por frontend y backend.
- Express sirve la API JSON y tambien el build estatico de React desde el mismo dominio y puerto en produccion.
- El servidor mantiene el estado en memoria para cumplir con el alcance academico inicial.

## Restricciones Tecnicas

- No se uso Tailwind CSS, Bootstrap, Material UI, Shadcn ni librerias UI externas.
- No se uso Axios; la comunicacion HTTP se realiza con `fetch` nativo.
- No se uso React Router ni Redux; la navegacion visual se maneja con `useState` mediante `gameStage`.
- No se uso Canvas ni motor de juego; los mapas se renderizan con DOM, CSS Grid y CSS puro.

## Estado Autoritativo

El cliente solo envia intenciones de movimiento o distraccion. Express valida limites del tablero, paredes, puertas bloqueadas, llaves, interruptores, recoleccion de objetos, movimiento de la Sombra, cordura, progreso de memoria y condiciones finales.

## Interfaz

- La interfaz usa una pantalla dividida `grid-template-columns: 1fr 1fr`.
- La estetica retro se implementa con patrones CSS, pseudo-elementos y animaciones.
- La caja narrativa inferior imita una ventana de dialogo RPG con retrato del hablante.
- Los retratos y sprites se sirven como PNG desde `apps/client/public/avatars`, `apps/client/public/sprites` y se mantienen rutas de fallback sin librerias externas.
- Las cinematicas de recuerdos se disparan desde datos devueltos por el backend en `lastMemory`, evitando que el cliente invente eventos narrativos no validados.
- Cada recuerdo del mapa esta definido por coordenada en un catalogo backend y entrega `scenes` por paso para evitar textos o imagenes repetidas por acto.
- La pantalla de controles es una etapa visual `controls` independiente del menu, implementada sin router externo.
- La cooperacion cruzada se resuelve en servidor con `reasonKeys`, `emotionSwitches` y `doorsLocked`.
- La IA de la Sombra es determinista por distancia Manhattan y expone `enemyMoved` / `enemyTargetPosition` para animacion visual en React.
- El bloqueo alternado de recuerdos se resuelve en servidor con `lastMemoryCollectedBy`, `reasonMemoryLock` y `emotionMemoryLock` para impedir que un rol acumule dos recuerdos consecutivos.
- El HUD de partida fue reducido a una sola fila de 50px para priorizar los tableros y evitar paneles permanentes que tapen el mapa.
- El HUD final usa bloques de HP y texto compacto para que la cordura sea legible sin ocupar ancho completo innecesario.
- Las escenas narrativas de recuerdos se resuelven desde `apps/client/src/components/SceneRenderer.tsx` hacia `/images/school_classroom.png`, `/images/school_hallway.png`, `/images/rain_car.png`, `/images/rain_street.png`, `/images/crash_detail.png` y `/images/mirror_shards.png`, con fallback SVG pixel-art local para evitar pantallas rotas durante desarrollo.
- La victoria no muestra una pantalla estatica; usa una secuencia final de cuatro pasos con cliffhanger y tarjeta `CAPITULO 2: PROXIMAMENTE`.
- El audio se sintetiza con Web Audio API nativa en `apps/client/src/utils/audio.ts`; no se descargan archivos MP3 ni se usa Howler u otra libreria externa. Incluye musica ambiental de osciladores graves, mute global, blips de voz por caracter y efectos de choque, lluvia y cristales.
- La caja de dialogo usa un formato flotante semitransparente para no ocultar permanentemente el tablero.

## Riesgos

- El estado en memoria se pierde al reiniciar el servidor. Para produccion real se podria usar persistencia, pero no se agrego para mantener el alcance simple.
- Las pruebas E2E cubren inicio, controles, movimiento, comunicacion HTTP, accion invalida y cinematica de memoria; los finales completos se pueden forzar mediante pruebas de integracion del estado autoritativo.
- La estetica pixel-art en CSS puede variar ligeramente segun navegador, aunque no depende de librerias externas. Los PNG se incluyen en `public` para que se publiquen junto al build.

## Registro De Uso De IA

Se utilizo asistencia de IA para inicializar la estructura fullstack, generar componentes base, documentacion, pruebas E2E, estilos CSS retro y validaciones de TypeScript. Las decisiones se mantuvieron alineadas con la rubrica tecnica del proyecto.
