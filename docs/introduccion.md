# Introduccion

## Proposito

En Blanco es un juego web cooperativo de terror psicologico construido con React, TypeScript, Express y CSS puro. El proyecto busca demostrar una arquitectura fullstack funcional donde el backend mantiene la autoridad del estado del juego y el frontend representa una experiencia tactica narrativa en tiempo real.

## Concepto Del Juego

La historia ocurre dentro de una mente fragmentada despues de una semana perdida. Dos manifestaciones de la psique deben colaborar para reconstruir los siete dias olvidados antes de que la Cordura global llegue a cero.

La Razon representa la capa logica: analiza pistas, codigos, candados y rutas frias. Su espacio visual utiliza tonos azules, baldosas hospitalarias y objetos asociados a investigacion.

La Emocion representa la capa afectiva: interpreta recuerdos distorsionados, traumas y simbolos surrealistas. Su espacio visual utiliza tonos rojos, morados, alfombras deformadas y sombras animadas.

## Experiencia De Usuario

La aplicacion inicia con una pantalla de menu retro pixel-art. Desde el menu se puede abrir una pantalla completa de controles dividida en dos paneles: La Razon con `WASD` y La Emocion con flechas. Al comenzar la historia, el frontend llama a `POST /api/game/reset` para reiniciar el estado autoritativo en el servidor y despues muestra una secuencia cinematica introductoria.

Durante la partida, la pantalla se divide en dos columnas de igual tamano. Cada columna contiene un tilemap top-down de 7x7 inspirado en RPGs clasicos de 16 bits. La parte inferior muestra una caja de dialogo estilo RPG con retrato del hablante y texto con efecto de maquina de escribir.

Cuando un jugador recoge un recuerdo, el juego se pausa y aparece una cinematica flotante con escenas SVG pixel-art anime: aula al atardecer, carretera lluviosa con choque y mente dividida. La caja de dialogo usa placa de hablante y typewriter con blips sintetizados. El jugador avanza con `ESPACIO` o con el boton del modal.

Al alcanzar el 100% de memoria, la partida activa una cinematica final en cuatro pasos: repaso de recuerdos, cliffhanger, corte a negro y tarjeta final `EN BLANCO - CAPITULO 1 COMPLETADO` / `CAPITULO 2: PROXIMAMENTE`.

## Objetivo

El objetivo comun es alcanzar `memoryProgress >= 100` recogiendo pistas, recuerdos y eventos de mapa. La cooperacion es obligatoria: La Razon abre puertas de trauma para La Emocion mediante llaves logicas, y La Emocion elimina muros de negacion para La Razon mediante interruptores emocionales. La derrota ocurre si `sanity <= 0` debido al contacto con la Sombra de Trauma o eventos negativos.

## Boceto De Pantalla

```text
┌──────────────────────────────────────────────────────────────────────┐
│ CORDURA / HP       PROGRESO DE MEMORIA       CO-OP       AUDIO RESET  │
├────────────────────────────────┬─────────────────────────────────────┤
│       TABLERO LA RAZON         │          TABLERO LA EMOCION          │
│       mapa 7 x 7 / WASD / Q    │          mapa 7 x 7 / FLECHAS / ENTER│
├────────────────────────────────┴─────────────────────────────────────┤
│ Mensajes de estado, errores, recuerdos y cooperacion                 │
└──────────────────────────────────────────────────────────────────────┘
```

React representa el escenario, recibe teclado y presenta el estado recibido. Express crea y valida la partida, mueve la Sombra, controla recursos, registra logs y decide victoria o derrota.
