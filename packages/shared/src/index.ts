export type PlayerRole = 'reason' | 'emotion';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
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
  logs: string[];
  gameOver: boolean;
  gameWon: boolean;
}

export interface GameActionRequest {
  role: PlayerRole;
  actionType: 'move';
  direction: Direction;
}
