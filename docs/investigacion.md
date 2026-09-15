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

Casos pendientes recomendados:

- Movimiento valido con `WASD` y verificacion de actualizacion de posicion.
- Movimiento valido con flechas para La Emocion.
- Accion invalida contra pared o fuera del tablero.
- Derrota al reducir `sanity` a cero.
- Victoria al alcanzar `memoryProgress >= 100`.

## CI/CD

La carpeta `.github/workflows/` contiene tres workflows:

- `linter.yml`: instala dependencias, ejecuta `npm run lint` y `npm run typecheck`.
- `e2e.yml`: instala Playwright y ejecuta `npm run test:e2e`.
- `deploy.yml`: valida build Docker y puede disparar deploy en Render mediante `RENDER_DEPLOY_HOOK_URL`.

## Despliegue

El proyecto incluye `Dockerfile` y `render.yaml`. La imagen Docker compila los workspaces, genera el build de React y ejecuta Express como servidor unico.

Variables relevantes:

- `PORT`: puerto usado por Express. Por defecto es `3000`.
- `NODE_ENV`: `production` en runtime Docker.

## Accesibilidad Y UX

- Las regiones principales tienen `aria-label` para identificar La Razon y La Emocion.
- La caja de dialogo usa `aria-live="polite"` para cambios narrativos.
- El menu inicial usa botones HTML nativos.
- La interfaz conserva controles por teclado y textos visibles de ayuda.

## Referencias Conceptuales

- RPG top-down clasico: composicion por tiles, HUD y caja de dialogo inferior.
- Terror psicologico: amenaza persistente, perdida de memoria y recursos mentales limitados.
- Cooperacion asimetrica: dos jugadores con perspectivas visuales y simbolicas distintas.
