import type { Direction, GameActionRequest, GameState, PlayerRole, Position } from '@en-blanco/shared';

const boardSize = 7;

const directionDeltas: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const initialReasonGrid: number[][] = [
  [0, 0, 1, 0, 2, 0, 0],
  [0, 4, 1, 0, 0, 0, 0],
  [0, 2, 0, 0, 1, 0, 3],
  [0, 0, 0, 6, 1, 0, 0],
  [1, 1, 0, 6, 0, 2, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 3, 0, 0, 0, 0, 0],
];

const initialEmotionGrid: number[][] = [
  [0, 0, 0, 2, 0, 1, 0],
  [0, 1, 0, 5, 0, 1, 0],
  [0, 1, 3, 0, 2, 0, 0],
  [0, 0, 0, 6, 6, 6, 0],
  [2, 0, 1, 0, 3, 1, 0],
  [0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0],
];

interface MemoryCatalogEntry {
  id: string;
  title: string;
  discoveredBy: PlayerRole;
  textSteps: string[];
  scenes: string[];
}

const memoryCatalog: Record<string, MemoryCatalogEntry> = {
  'reason:4,0': {
    id: 'memory-1-reason-classroom',
    title: 'RECUERDO #1: LA DISCUSION EN EL AULA',
    discoveredBy: 'reason',
    scenes: ['school_classroom', 'school_classroom', 'school_classroom'],
    textSteps: [
      'PERSPECTIVA DE LA RAZON: 14:32 hrs. La discusion empezo antes de la lluvia, frente a pupitres todavia tibios por el sol.',
      'Registro verbal: acusaciones cruzadas, tres testigos mirando hacia otro lado y una salida emocional no resuelta.',
      'Conclusion fria: el accidente no nacio en la carretera. Nacio cuando todos decidieron callar.',
    ],
  },
  'emotion:3,0': {
    id: 'memory-2-emotion-hallway',
    title: 'RECUERDO #2: EL PASILLO VACIO',
    discoveredBy: 'emotion',
    scenes: ['school_hallway', 'school_hallway', 'school_hallway'],
    textSteps: [
      'PERSPECTIVA DE LA EMOCION: El pasillo parecia mas largo porque nadie caminaba conmigo.',
      'Las voces de clase se volvieron murmullos. Cada mirada decia que quedarse solo era culpa mia.',
      'El miedo real no era discutir. Era descubrir que despues de gritar, nadie vuelve a sentarse a tu lado.',
    ],
  },
  'reason:1,2': {
    id: 'memory-3-reason-rain-car',
    title: 'RECUERDO #3: EL VELOCIMETRO',
    discoveredBy: 'reason',
    scenes: ['rain_car', 'rain_car', 'rain_car'],
    textSteps: [
      'PERSPECTIVA DE LA RAZON: Velocidad visible antes del impacto: 82 km/h. Lluvia intensa. Visibilidad reducida.',
      'El pie piso el freno 1.4 segundos tarde. La distancia de frenado no alcanzaba para una curva mojada.',
      'Dato recuperado: alguien giro el volante antes de que la amenaza pudiera verse con claridad.',
    ],
  },
  'emotion:4,2': {
    id: 'memory-4-emotion-rain-street',
    title: 'RECUERDO #4: LA TORMENTA',
    discoveredBy: 'emotion',
    scenes: ['rain_street', 'rain_street', 'rain_street'],
    textSteps: [
      'PERSPECTIVA DE LA EMOCION: La lluvia no caia sobre el parabrisas; caia directamente dentro del pecho.',
      'El impacto fue primero un silencio. Luego todo mi cuerpo entendio el miedo antes que la mente.',
      'No recuerdo haber llorado. Recuerdo no poder respirar mientras las luces rojas parpadeaban en la calle.',
    ],
  },
  'reason:5,4': {
    id: 'memory-5-reason-crash-detail',
    title: 'RECUERDO #5: DIAGNOSTICO DEL CHOQUE',
    discoveredBy: 'reason',
    scenes: ['crash_detail', 'crash_detail', 'crash_detail'],
    textSteps: [
      'PERSPECTIVA DE LA RAZON: Impacto lateral izquierdo, deformacion concentrada y vidrio proyectado hacia el asiento trasero.',
      'El patron de fractura no coincide con una perdida simple de control. Hubo una segunda fuerza en la maniobra.',
      'La evidencia ordena el horror: sobrevivimos porque alguien eligio recibir el golpe por nosotros.',
    ],
  },
  'emotion:0,4': {
    id: 'memory-6-emotion-mirror-shards',
    title: 'RECUERDO #6: EL ESPEJO DE LA VERDAD',
    discoveredBy: 'emotion',
    scenes: ['mirror_shards', 'mirror_shards', 'mirror_shards'],
    textSteps: [
      'PERSPECTIVA DE LA EMOCION: El espejo roto ya no muestra dos monstruos, muestra dos formas de proteger el mismo dolor.',
      'La Razon recuerda los datos. La Emocion recuerda el temblor. Ninguna de las dos estaba mintiendo.',
      'La verdad integrada no borra el choque, pero deja de repetirlo en silencio dentro de la cabeza.',
    ],
  },
};

const actNames = {
  act1: 'ACTO 1: EL DETONANTE',
  act2: 'ACTO 2: EL COLAPSO',
  act3: 'ACTO 3: LA VERDAD',
} as const;

let state: GameState = createInitialState();
let distraction: { role: PlayerRole; turns: number } | null = null;

export function getGameState(): GameState {
  return cloneState(state);
}

export function resetGameState(): GameState {
  distraction = null;
  state = createInitialState();
  return getGameState();
}

export function applyGameAction(payload: unknown): GameState {
  state.enemyMoved = false;
  state.enemyTargetPosition = { ...state.shadowPos };
  state.lastMemory = null;

  if (state.gameOver || state.gameWon) {
    appendLog('La partida ya termino. Reinicia para entrar de nuevo en la mente.');
    return getGameState();
  }

  if (!isGameActionRequest(payload)) {
    appendLog('Accion rechazada: formato invalido. Usa role, actionType y direction para moverte.');
    return getGameState();
  }

  if (payload.actionType === 'distract') {
    distraction = { role: payload.role, turns: 2 };
    appendLog(`${labelRole(payload.role)} usa Grito / Distraccion. La Sombra lo priorizara durante 2 turnos.`);
    moveShadow();
    resolveShadowCollision();
    updateEndState();
    state.currentTurn = payload.role;
    return getGameState();
  }

  if (!payload.direction) {
    appendLog('Accion rechazada: movimiento sin direccion valida.');
    return getGameState();
  }

  const currentPos = payload.role === 'reason' ? state.reasonPos : state.emotionPos;
  const targetPos = {
    x: currentPos.x + directionDeltas[payload.direction].x,
    y: currentPos.y + directionDeltas[payload.direction].y,
  };

  if (!isInsideBoard(targetPos)) {
    appendLog('Accion rechazada: el destino queda fuera del tablero 7x7.');
    return getGameState();
  }

  const grid = payload.role === 'reason' ? state.reasonGrid : state.emotionGrid;
  const cellValue = getCell(grid, targetPos);
  if (cellValue === 1) {
    appendLog('Accion rechazada: una pared mental bloquea el paso.');
    return getGameState();
  }

  if (cellValue === 6) {
    const message = payload.role === 'reason'
      ? 'Accion rechazada: Muro de Negacion activo. La Emocion debe activar su interruptor.'
      : 'Accion rechazada: Puerta de Trauma cerrada. La Razon debe encontrar una llave logica.';
    appendLog(message);
    return getGameState();
  }

  if (cellValue === 2 && isMemoryLocked(payload.role)) {
    appendLog(`${labelRole(payload.role)} no puede registrar otro recuerdo todavia. Esperando al otro fragmento de la psique.`);
    return getGameState();
  }

  movePlayer(payload.role, targetPos, cellValue);
  moveShadow();
  resolveShadowCollision();
  updateEndState();
  state.currentTurn = payload.role;
  state.doorsLocked = state.reasonKeys === 0 || !state.emotionSwitches;

  return getGameState();
}

function createInitialState(): GameState {
  const initialShadow = getRandomOpenPosition();
  return {
    sanity: 100,
    memoryProgress: 0,
    currentTurn: 'reason',
    reasonPos: { x: 0, y: 0 },
    emotionPos: { x: 6, y: 6 },
    shadowPos: initialShadow,
    reasonGrid: cloneGrid(initialReasonGrid),
    emotionGrid: cloneGrid(initialEmotionGrid),
    reasonKeys: 0,
    emotionSwitches: false,
    doorsLocked: true,
    lastMemoryCollectedBy: null,
    reasonMemoryLock: false,
    emotionMemoryLock: false,
    logs: [`${actNames.act1}: La discusion previa al evento vuelve como ruido de fondo.`],
    lastMemory: null,
    enemyMoved: false,
    enemyTargetPosition: initialShadow,
    defeatedBy: null,
    gameOver: false,
    gameWon: false,
  };
}

function getRandomOpenPosition(): Position {
  const openPositions: Position[] = [];
  for (let y = 0; y < boardSize; y += 1) {
    for (let x = 0; x < boardSize; x += 1) {
      const position = { x, y };
      if (!samePosition(position, { x: 0, y: 0 }) && !samePosition(position, { x: 6, y: 6 })
        && getCell(initialReasonGrid, position) !== 1 && getCell(initialEmotionGrid, position) !== 1) {
        openPositions.push(position);
      }
    }
  }

  return openPositions[Math.floor(Math.random() * openPositions.length)] ?? { x: 3, y: 3 };
}

function movePlayer(role: PlayerRole, targetPos: Position, cellValue: number): void {
  if (role === 'reason') {
    state.reasonPos = targetPos;
  } else {
    state.emotionPos = targetPos;
  }

  appendLog(`${labelRole(role)} avanza a (${targetPos.x}, ${targetPos.y}).`);

  if (cellValue === 2) {
    state.memoryProgress = Math.min(100, state.memoryProgress + 18);
    setCell(role === 'reason' ? state.reasonGrid : state.emotionGrid, targetPos, 0);
    appendLog(`${labelRole(role)} recupera un fragmento de memoria.`);
    applyAlternatingMemoryLock(role);
    setMemoryCinematic(role, targetPos);
  }

  if (cellValue === 3) {
    if (role === 'reason') {
      state.memoryProgress = Math.min(100, state.memoryProgress + 12);
      appendLog('La Razon descifra un candado interno y ordena el caos.');
    } else {
      state.sanity = Math.max(0, state.sanity - 15);
      appendLog('La Emocion toca un trauma abierto. La cordura se fractura.');
    }
    setCell(role === 'reason' ? state.reasonGrid : state.emotionGrid, targetPos, 0);
  }

  if (cellValue === 4 && role === 'reason') {
    state.reasonKeys += 1;
    setCell(state.reasonGrid, targetPos, 0);
    replaceCells(state.emotionGrid, 6, 0);
    appendLog('La Razon obtiene una llave logica. La Puerta de Trauma de La Emocion se abre.');
  }

  if (cellValue === 5 && role === 'emotion') {
    state.emotionSwitches = true;
    setCell(state.emotionGrid, targetPos, 0);
    replaceCells(state.reasonGrid, 6, 0);
    appendLog('La Emocion activa un interruptor emocional. Los Muros de Negacion de La Razon desaparecen.');
  }
}

function setMemoryCinematic(role: PlayerRole, targetPos: Position): void {
  const memory = memoryCatalog[getMemoryKey(role, targetPos)];
  if (!memory) {
    appendLog('El fragmento no tiene una cinematica asociada. La mente lo descarta como ruido residual.');
    return;
  }

  state.lastMemory = {
    id: memory.id,
    title: memory.title,
    discoveredBy: memory.discoveredBy,
    textSteps: [...memory.textSteps],
    scenes: [...memory.scenes],
  };
}

function getMemoryKey(role: PlayerRole, position: Position): string {
  return `${role}:${position.x},${position.y}`;
}

function isMemoryLocked(role: PlayerRole): boolean {
  return role === 'reason' ? state.reasonMemoryLock : state.emotionMemoryLock;
}

function applyAlternatingMemoryLock(role: PlayerRole): void {
  state.lastMemoryCollectedBy = role;
  if (role === 'reason') {
    state.reasonMemoryLock = true;
    state.emotionMemoryLock = false;
    appendLog('Memoria de La Razon registrada. Esperando a La Emocion...');
  } else {
    state.emotionMemoryLock = true;
    state.reasonMemoryLock = false;
    appendLog('Memoria de La Emocion registrada. Esperando a La Razon...');
  }
}

function moveShadow(): void {
  const targetRole = getShadowTargetRole();
  const targetPosition = targetRole === 'reason' ? state.reasonPos : state.emotionPos;
  const next = getNextShadowPosition(targetPosition);

  if (next) {
    state.shadowPos = next;
    state.enemyMoved = true;
    state.enemyTargetPosition = next;
  }

  if (distraction) {
    distraction.turns -= 1;
    if (distraction.turns <= 0) distraction = null;
  }
}

function getShadowTargetRole(): PlayerRole {
  if (distraction) return distraction.role;

  const reasonDistance = distance(state.shadowPos, state.reasonPos);
  const emotionDistance = distance(state.shadowPos, state.emotionPos);
  return emotionDistance <= reasonDistance ? 'emotion' : 'reason';
}

function getNextShadowPosition(target: Position): Position | null {
  const deltaX = Math.sign(target.x - state.shadowPos.x);
  const deltaY = Math.sign(target.y - state.shadowPos.y);
  const horizontal = { x: state.shadowPos.x + deltaX, y: state.shadowPos.y };
  const vertical = { x: state.shadowPos.x, y: state.shadowPos.y + deltaY };
  const preferred = Math.abs(target.x - state.shadowPos.x) >= Math.abs(target.y - state.shadowPos.y)
    ? [horizontal, vertical]
    : [vertical, horizontal];

  return preferred.find((position) => !samePosition(position, state.shadowPos) && isInsideBoard(position) && !isWallForShadow(position)) ?? null;
}

function resolveShadowCollision(): void {
  if (samePosition(state.shadowPos, state.emotionPos)) {
    state.sanity = Math.max(0, state.sanity - 25);
    if (state.sanity <= 0) state.defeatedBy = 'emotion';
    appendLog('La Sombra alcanza a La Emocion. La cordura cae violentamente.');
  }

  if (samePosition(state.shadowPos, state.reasonPos)) {
    state.sanity = Math.max(0, state.sanity - 10);
    if (state.sanity <= 0) state.defeatedBy = 'reason';
    appendLog('La Sombra roza a La Razon. La certeza se debilita.');
  }
}

function updateEndState(): void {
  if (state.memoryProgress >= 100) {
    state.gameWon = true;
    appendLog(`${actNames.act3}: La mente se unifica y acepta la verdad completa.`);
  }

  if (state.sanity <= 0) {
    state.gameOver = true;
    appendLog('La mente colapso en la negacion.');
  }
}

function isGameActionRequest(value: unknown): value is GameActionRequest {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<GameActionRequest>;
  if (candidate.role !== 'reason' && candidate.role !== 'emotion') return false;
  if (candidate.actionType === 'distract') return true;
  return candidate.actionType === 'move' && isDirection(candidate.direction);
}

function isInsideBoard(position: Position): boolean {
  return position.x >= 0 && position.y >= 0 && position.x < boardSize && position.y < boardSize;
}

function isDirection(value: unknown): value is Direction {
  return value === 'up' || value === 'down' || value === 'left' || value === 'right';
}

function isWallForShadow(position: Position): boolean {
  return getCell(state.reasonGrid, position) === 1 || getCell(state.emotionGrid, position) === 1;
}

function getCell(grid: number[][], position: Position): number {
  return grid[position.y]?.[position.x] ?? 1;
}

function setCell(grid: number[][], position: Position, value: number): void {
  grid[position.y][position.x] = value;
}

function replaceCells(grid: number[][], from: number, to: number): void {
  for (const row of grid) {
    for (let x = 0; x < row.length; x += 1) {
      if (row[x] === from) row[x] = to;
    }
  }
}

function distance(first: Position, second: Position): number {
  return Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
}

function samePosition(first: Position, second: Position): boolean {
  return first.x === second.x && first.y === second.y;
}

function labelRole(role: PlayerRole): string {
  return role === 'reason' ? 'La Razon' : 'La Emocion';
}

function appendLog(entry: string): void {
  state.logs = [entry, ...state.logs].slice(0, 8);
}

function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

function cloneState(gameState: GameState): GameState {
  return {
    ...gameState,
    reasonPos: { ...gameState.reasonPos },
    emotionPos: { ...gameState.emotionPos },
    shadowPos: { ...gameState.shadowPos },
    reasonGrid: cloneGrid(gameState.reasonGrid),
    emotionGrid: cloneGrid(gameState.emotionGrid),
    logs: [...gameState.logs],
    lastMemory: gameState.lastMemory ? { ...gameState.lastMemory, textSteps: [...gameState.lastMemory.textSteps], scenes: [...gameState.lastMemory.scenes] } : null,
    enemyTargetPosition: { ...gameState.enemyTargetPosition },
  };
}
