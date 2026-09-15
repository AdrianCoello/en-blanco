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
  [0, 0, 1, 0, 0, 0, 0],
  [0, 2, 0, 0, 1, 0, 3],
  [0, 0, 0, 0, 1, 0, 0],
  [1, 1, 0, 0, 0, 2, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 3, 0, 0, 0, 0, 2],
];

const initialEmotionGrid: number[][] = [
  [0, 0, 0, 2, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 1, 3, 0, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [2, 0, 1, 0, 3, 1, 0],
  [0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 0],
];

let state: GameState = createInitialState();

export function getGameState(): GameState {
  return cloneState(state);
}

export function resetGameState(): GameState {
  state = createInitialState();
  return getGameState();
}

export function applyGameAction(payload: unknown): GameState {
  if (state.gameOver || state.gameWon) {
    appendLog('La partida ya termino. Reinicia para entrar de nuevo en la mente.');
    return getGameState();
  }

  if (!isGameActionRequest(payload)) {
    appendLog('Accion rechazada: formato invalido.');
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

  movePlayer(payload.role, targetPos, cellValue);
  moveShadowTowardNearestPlayer();
  resolveShadowCollision();
  updateEndState();
  state.currentTurn = payload.role;

  return getGameState();
}

function createInitialState(): GameState {
  return {
    sanity: 100,
    memoryProgress: 0,
    currentTurn: 'reason',
    reasonPos: { x: 0, y: 0 },
    emotionPos: { x: 6, y: 6 },
    shadowPos: { x: 3, y: 3 },
    reasonGrid: cloneGrid(initialReasonGrid),
    emotionGrid: cloneGrid(initialEmotionGrid),
    logs: ['La mente despierta en blanco. WASD mueve a La Razon; las flechas mueven a La Emocion.'],
    gameOver: false,
    gameWon: false,
  };
}

function movePlayer(role: PlayerRole, targetPos: Position, cellValue: number): void {
  if (role === 'reason') {
    state.reasonPos = targetPos;
  } else {
    state.emotionPos = targetPos;
  }

  appendLog(`${labelRole(role)} avanza a (${targetPos.x}, ${targetPos.y}).`);

  if (cellValue === 2) {
    state.memoryProgress = Math.min(100, state.memoryProgress + 15);
    setCell(role === 'reason' ? state.reasonGrid : state.emotionGrid, targetPos, 0);
    appendLog(`${labelRole(role)} recupera un fragmento de memoria.`);
  }

  if (cellValue === 3) {
    if (role === 'reason') {
      state.memoryProgress = Math.min(100, state.memoryProgress + 10);
      appendLog('La Razon descifra un candado interno.');
    } else {
      state.sanity = Math.max(0, state.sanity - 15);
      appendLog('La Emocion toca un trauma abierto. La cordura se fractura.');
    }
    setCell(role === 'reason' ? state.reasonGrid : state.emotionGrid, targetPos, 0);
  }
}

function moveShadowTowardNearestPlayer(): void {
  const reasonDistance = distance(state.shadowPos, state.reasonPos);
  const emotionDistance = distance(state.shadowPos, state.emotionPos);
  const target = emotionDistance <= reasonDistance ? state.emotionPos : state.reasonPos;
  const options: Position[] = [
    { x: state.shadowPos.x + Math.sign(target.x - state.shadowPos.x), y: state.shadowPos.y },
    { x: state.shadowPos.x, y: state.shadowPos.y + Math.sign(target.y - state.shadowPos.y) },
  ];
  const next = options.find((position) => isInsideBoard(position) && !isWallForShadow(position));

  if (next) {
    state.shadowPos = next;
    appendLog(`La Sombra de Trauma se desplaza a (${next.x}, ${next.y}).`);
  }
}

function resolveShadowCollision(): void {
  if (samePosition(state.shadowPos, state.emotionPos)) {
    state.sanity = Math.max(0, state.sanity - 25);
    appendLog('La Sombra alcanza a La Emocion. La cordura cae violentamente.');
  }

  if (samePosition(state.shadowPos, state.reasonPos)) {
    state.sanity = Math.max(0, state.sanity - 10);
    appendLog('La Sombra roza a La Razon. La certeza se debilita.');
  }
}

function updateEndState(): void {
  if (state.memoryProgress >= 100) {
    state.gameWon = true;
    appendLog('Victoria: los siete dias perdidos vuelven a tener forma.');
  }

  if (state.sanity <= 0) {
    state.gameOver = true;
    appendLog('Derrota: la psique colapsa antes de recordar.');
  }
}

function isGameActionRequest(value: unknown): value is GameActionRequest {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<GameActionRequest>;
  return (
    (candidate.role === 'reason' || candidate.role === 'emotion') &&
    candidate.actionType === 'move' &&
    isDirection(candidate.direction)
  );
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
  };
}
