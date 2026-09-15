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

El cliente solo envia intenciones de movimiento. Express valida limites del tablero, paredes, recoleccion de objetos, movimiento de la Sombra, cordura, progreso de memoria y condiciones finales.

## Interfaz

- La interfaz usa una pantalla dividida `grid-template-columns: 1fr 1fr`.
- La estetica retro se implementa con patrones CSS, pseudo-elementos y animaciones.
- La caja narrativa inferior imita una ventana de dialogo RPG con retrato del hablante.
- Los retratos se generan con CSS para evitar dependencias o assets externos obligatorios.

## Riesgos

- El estado en memoria se pierde al reiniciar el servidor. Para produccion real se podria usar persistencia, pero no se agrego para mantener el alcance simple.
- Las pruebas E2E actuales cubren el flujo principal inicial; faltan casos completos de victoria, derrota y acciones invalidas.
- La estetica pixel-art en CSS puede variar ligeramente segun navegador, aunque no depende de librerias externas.

## Registro De Uso De IA

Se utilizo asistencia de IA para inicializar la estructura fullstack, generar componentes base, documentacion, pruebas E2E, estilos CSS retro y validaciones de TypeScript. Las decisiones se mantuvieron alineadas con la rubrica tecnica del proyecto.
