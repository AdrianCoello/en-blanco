export type PlayerRole = 'reason' | 'emotion';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface MemoryCinematic {
  id: string;
  title: string;
  discoveredBy: PlayerRole;
  textSteps: string[];
  scenes: string[];
}

export interface GameState {
  sanity: number;
  memoryProgress: number;
  currentTurn: PlayerRole;
  reasonPos: Position;
  emotionPos: Position;
  shadowPos: Position;
  reasonGrid: number[][];
  emotionGrid: number[][];
  reasonKeys: number;
  emotionSwitches: boolean;
  doorsLocked: boolean;
  lastMemoryCollectedBy: PlayerRole | null;
  reasonMemoryLock: boolean;
  emotionMemoryLock: boolean;
  logs: string[];
  lastMemory: MemoryCinematic | null;
  enemyMoved: boolean;
  enemyTargetPosition: Position;
  defeatedBy: PlayerRole | null;
  gameOver: boolean;
  gameWon: boolean;
}

export interface GameActionRequest {
  role: PlayerRole;
  actionType: 'move' | 'distract';
  direction?: Direction;
}
