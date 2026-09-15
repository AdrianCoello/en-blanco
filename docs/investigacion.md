# Investigacion

## Pruebas E2E

El proyecto usa Playwright para pruebas E2E headless. La configuracion vive en `playwright.config.ts` y levanta el servidor de produccion local con:

```bash
npm run build && npm run start
```

La prueba actual valida el flujo inicial:

- Carga de pantalla de inicio.
- Inicio de historia.
- Visualizacion de cinematica.
- Salto con `ENTER`.
- Render de los dos roles en pantalla dividida.
- Visualizacion de la leyenda de controles y caja de dialogo.
- Movimiento y solicitud HTTP hacia `/api/game/action`.
- Rechazo visible de movimiento fuera del tablero.
- Apertura de un recuerdo y avance por sus tres pasos.

La prueba reinicia el estado con `POST /api/game/reset` antes de comenzar, por lo que tambien funciona si Playwright reutiliza el servidor local.

Para una defensa completa se puede complementar con una solicitud manual a la API y mostrar las pantallas finales desde un estado preparado.

## CI/CD

La carpeta `.github/workflows/` contiene tres workflows:

- `linter.yml`: instala dependencias, ejecuta `npm run lint` y `npm run typecheck`.
- `e2e.yml`: instala Playwright y ejecuta `npm run test:e2e`.
- `deploy.yml`: valida build Docker y puede disparar deploy en Render mediante `RENDER_DEPLOY_HOOK_URL`.

Los workflows usan `npm ci` para respetar exactamente el `package-lock.json`. El workflow de deploy siempre construye Docker; el disparo de Render queda condicionado a que el secreto este configurado.

## Despliegue

El proyecto incluye `Dockerfile` y `render.yaml`. La imagen Docker compila los workspaces, genera el build de React y ejecuta Express como servidor unico.

Variables relevantes:

- `PORT`: puerto usado por Express. Por defecto es `3000`.
- `NODE_ENV`: `production` en runtime Docker.

La aplicacion publicada y verificada es `https://en-blanco.onrender.com`. El endpoint de salud es `https://en-blanco.onrender.com/api/game/state` y devuelve el `GameState` en JSON.

## Accesibilidad Y UX

- Las regiones principales tienen `aria-label` para identificar La Razon y La Emocion.
- La caja de dialogo usa `aria-live="polite"` para cambios narrativos.
- El menu inicial usa botones HTML nativos.
- La interfaz conserva controles por teclado y textos visibles de ayuda.
- La pantalla de controles usa teclas dibujadas con CSS y simbolos de flecha visibles para Jugador 2.

## Audio Nativo

El proyecto usa `window.AudioContext` y `webkitAudioContext` como fallback para generar sonidos 8-bit por codigo:

- `ensureAudioStarted()`: desbloquea el contexto con la primera interaccion del menu.
- `startAmbientMusic()`: cama ambiental suave con osciladores senoidales de 110Hz y 164Hz filtrados por `lowpass` a 400Hz.
- `startHorrorMusic()` / `stopHorrorMusic()`: drone grave y tenso reservado para la partida y las cinematicas finales; el ambiente suave se conserva para el menu.
- `playHeartbeatSound()`: doble pulso grave sincronizado cada 1.4 segundos con la pantalla titilante `Corte a Negro`.
- `playDefeatSound()`: efecto exclusivo de derrota con tonos disonantes, subgrave y ruido filtrado.
- `setAudioMuted()`: mute global conectado al HUD con boton `🔊/🔇`.
- `playVoiceBlip()`: voz retro sincronizada con cada caracter del typewriter.
- `playCarCrashSound()`: ruido blanco filtrado y tono grave para el choque.
- `playRainSound()` / `stopRainSound()`: estatica filtrada continua para lluvia.
- `playGlassShatterSound()`: tonos agudos descendentes para cristales rotos.
- `playStepSound()`: blip corto para movimiento.
- `playMemorySound()`: escala ascendente para recuerdos, llaves o interruptores.
- `playEnemySound()`: pulso grave cuando la Sombra se desplaza.
- `playClickSound()`: clic de interfaz.

No se usan librerias de audio ni archivos externos.

## Referencias Conceptuales

- RPG top-down clasico: composicion por tiles, HUD y caja de dialogo inferior.
- Terror psicologico: amenaza persistente, perdida de memoria y recursos mentales limitados.
- Cooperacion asimetrica: dos jugadores con perspectivas visuales y simbolicas distintas.
