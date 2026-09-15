import { useEffect, useRef, useState } from 'react';
import type { Direction, GameActionRequest, GameState, PlayerRole, Position } from '@en-blanco/shared';

type GameStage = 'menu' | 'cinematic' | 'playing' | 'gameover' | 'victory';
type Speaker = PlayerRole | 'narrator';

const boardSize = 7;
const cooldownMs = 250;
const cinematicLines = [
  'No recuerdas lo que paso la ultima semana...',
  'Tu mente se ha dividido en dos fragmentos: la Logica que busca respuestas y la Emocion que siente el trauma.',
  'Debes reconstruir los 7 dias perdidos antes de que la Sombra te consuma.',
];

const keyBindings: Record<string, { role: PlayerRole; direction: Direction }> = {
  w: { role: 'reason', direction: 'up' },
  a: { role: 'reason', direction: 'left' },
  s: { role: 'reason', direction: 'down' },
  d: { role: 'reason', direction: 'right' },
  ArrowUp: { role: 'emotion', direction: 'up' },
  ArrowLeft: { role: 'emotion', direction: 'left' },
  ArrowDown: { role: 'emotion', direction: 'down' },
  ArrowRight: { role: 'emotion', direction: 'right' },
};

export function App() {
  const [gameStage, setGameStage] = useState<GameStage>('menu');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string>('');
  const [dialogIndex, setDialogIndex] = useState(0);
  const latestState = useRef<GameState | null>(null);
  const latestStage = useRef<GameStage>('menu');
  const lastKeyTime = useRef<Record<string, number>>({});

  useEffect(() => {
    latestState.current = gameState;
    setDialogIndex(0);
  }, [gameState?.logs]);

  useEffect(() => {
    latestStage.current = gameStage;
  }, [gameStage]);

  useEffect(() => {
    void loadGameState();
  }, []);

  useEffect(() => {
    if (!gameState) return;
    if (gameState.gameWon) setGameStage('victory');
    if (gameState.gameOver) setGameStage('gameover');
  }, [gameState]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const currentStage = latestStage.current;

      if (currentStage === 'cinematic' && event.key === 'Enter') {
        event.preventDefault();
        setGameStage('playing');
        return;
      }

      if (currentStage === 'playing' && event.code === 'Space') {
        event.preventDefault();
        setDialogIndex((current) => getNextDialogIndex(current, latestState.current));
        return;
      }

      if (currentStage !== 'playing') return;

      const binding = keyBindings[event.key] ?? keyBindings[event.key.toLowerCase()];
      const currentState = latestState.current;
      if (!binding || !currentState || currentState.gameOver || currentState.gameWon) return;

      const now = Date.now();
      const cooldownKey = `${binding.role}-${binding.direction}`;
      if (now - (lastKeyTime.current[cooldownKey] ?? 0) < cooldownMs) return;

      lastKeyTime.current[cooldownKey] = now;
      event.preventDefault();
      void sendAction(binding.role, binding.direction);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function loadGameState(): Promise<void> {
    try {
      const response = await fetch('/api/game/state');
      const nextState = (await response.json()) as GameState;
      setGameState(nextState);
      setError('');
    } catch {
      setError('No se pudo conectar con el servidor de la mente.');
    }
  }

  async function startStory(): Promise<void> {
    await resetGame();
    setGameStage('cinematic');
  }

  async function sendAction(role: PlayerRole, direction: Direction): Promise<void> {
    const payload: GameActionRequest = { role, actionType: 'move', direction };

    try {
      const response = await fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const nextState = (await response.json()) as GameState;
      setGameState(nextState);
      setError('');
    } catch {
      setError('La accion no llego al backend.');
    }
  }

  async function resetGame(): Promise<void> {
    const response = await fetch('/api/game/reset', { method: 'POST' });
    const nextState = (await response.json()) as GameState;
    setGameState(nextState);
    setDialogIndex(0);
    setError('');
  }

  if (gameStage === 'menu') {
    return <StartScreen error={error} onStart={() => void startStory()} />;
  }

  if (gameStage === 'cinematic') {
    return <CinematicScreen onSkip={() => setGameStage('playing')} />;
  }

  if (!gameState) {
    return <main className="loading">{error || 'Cargando En Blanco...'}</main>;
  }

  const dialogText = error || gameState.logs[dialogIndex] || 'El silencio llena la habitacion.';
  const speaker = inferSpeaker(dialogText);

  return (
    <main className="app-shell">
      <Hud gameState={gameState} onReset={() => void startStory()} />
      <section className="split-screen">
        <PlayerPanel
          title="La Razon"
          role="reason"
          theme="reason"
          description="Entorno frio: pistas, codigos y candados de la memoria racional."
          grid={gameState.reasonGrid}
          position={gameState.reasonPos}
          shadowPos={gameState.shadowPos}
        />
        <PlayerPanel
          title="La Emocion"
          role="emotion"
          theme="emotion"
          description="Entorno surrealista: recuerdos, traumas y sombras que deforman el mapa."
          grid={gameState.emotionGrid}
          position={gameState.emotionPos}
          shadowPos={gameState.shadowPos}
        />
      </section>

      <DialogBox text={dialogText} speaker={speaker} />

      {(gameStage === 'gameover' || gameStage === 'victory') && (
        <section className="ending-screen" role="dialog" aria-modal="true">
          <h2>{gameStage === 'victory' ? 'Victoria' : 'Game Over'}</h2>
          <p>{gameStage === 'victory' ? 'Los recuerdos perdidos recuperan continuidad.' : 'La cordura llego a cero.'}</p>
          <button onClick={() => void startStory()}>Comenzar de nuevo</button>
        </section>
      )}
    </main>
  );
}

interface StartScreenProps {
  error: string;
  onStart: () => void;
}

function StartScreen({ error, onStart }: StartScreenProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <main className="start-screen">
      <section className="start-window" aria-label="Pantalla de inicio">
        <p className="start-kicker">RPG tactico narrativo</p>
        <h1>EN BLANCO</h1>
        <p className="start-subtitle">Un misterio en la psique dividida</p>
        <nav className="start-menu" aria-label="Menu principal">
          <button onClick={onStart}>Comenzar Historia</button>
          <button onClick={() => setShowInstructions((current) => !current)}>Instrucciones y Controles</button>
        </nav>
        {showInstructions && (
          <div className="instructions-panel">
            <p>Jugador 1: WASD mueve a La Razon.</p>
            <p>Jugador 2: Flechas mueve a La Emocion.</p>
            <p>ESPACIO avanza los dialogos. ENTER omite la introduccion.</p>
          </div>
        )}
        {error && <p className="start-error">{error}</p>}
      </section>
    </main>
  );
}

interface CinematicScreenProps {
  onSkip: () => void;
}

function CinematicScreen({ onSkip }: CinematicScreenProps) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (lineIndex >= cinematicLines.length - 1) return;

    const timeoutId = window.setTimeout(() => {
      setLineIndex((current) => current + 1);
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [lineIndex]);

  return (
    <main className="cinematic-screen">
      <p key={cinematicLines[lineIndex]} className="cinematic-line">{cinematicLines[lineIndex]}</p>
      <button className="skip-button" onClick={onSkip}>Omitir [ENTER]</button>
    </main>
  );
}

interface HudProps {
  gameState: GameState;
  onReset: () => void;
}

function Hud({ gameState, onReset }: HudProps) {
  return (
    <header className="hud">
      <p className="keyboard-legend">Jugador 1: Teclas WASD | Jugador 2: Flechas de Direccion</p>
      <div className="meter">
        <span>Cordura</span>
        <div className="bar"><i style={{ width: `${gameState.sanity}%` }} /></div>
        <strong>{gameState.sanity}%</strong>
      </div>
      <div className="meter">
        <span>Memoria Recuperada</span>
        <div className="bar memory"><i style={{ width: `${gameState.memoryProgress}%` }} /></div>
        <strong>{gameState.memoryProgress}%</strong>
      </div>
      <div className="turn-chip">Ultimo movimiento: {gameState.currentTurn === 'reason' ? 'La Razon' : 'La Emocion'}</div>
      <button className="reset-button" onClick={onReset}>Reset</button>
    </header>
  );
}

interface DialogBoxProps {
  text: string;
  speaker: Speaker;
}

function DialogBox({ text, speaker }: DialogBoxProps) {
  return (
    <section className={`dialog-box speaker-${speaker}`} aria-live="polite">
      <div className="portrait" aria-hidden="true" />
      <div className="dialog-content">
        <strong>{speakerLabel(speaker)}</strong>
        <p key={text}>{text}</p>
        <span>Continuar con [ESPACIO]</span>
      </div>
    </section>
  );
}

interface PlayerPanelProps {
  title: string;
  role: PlayerRole;
  theme: 'reason' | 'emotion';
  description: string;
  grid: number[][];
  position: Position;
  shadowPos: Position;
}

function PlayerPanel(props: PlayerPanelProps) {
  return (
    <section className={`panel ${props.theme}`} aria-label={props.title}>
      <div className="panel-copy">
        <p className="kicker">Control en tiempo real</p>
        <h1>{props.title}</h1>
        <p>{props.description}</p>
      </div>

      <div className="board" style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}>
        {props.grid.flatMap((row, y) => row.map((cell, x) => {
          const position = { x, y };
          const playerHere = samePosition(position, props.position);
          const shadowHere = samePosition(position, props.shadowPos);
          return (
            <div
              className={`cell ${props.theme}-tile cell-${cell} ${playerHere ? 'player-here' : ''} ${shadowHere ? 'shadow-here' : ''}`}
              key={`${props.role}-${x}-${y}`}
              aria-label={`${props.title} ${describeCell(cell, playerHere, shadowHere)} ${x},${y}`}
            />
          );
        }))}
      </div>
    </section>
  );
}

function getNextDialogIndex(current: number, state: GameState | null): number {
  if (!state || state.logs.length === 0) return 0;
  return (current + 1) % state.logs.length;
}

function inferSpeaker(text: string): Speaker {
  if (text.includes('La Razon')) return 'reason';
  if (text.includes('La Emocion')) return 'emotion';
  return 'narrator';
}

function speakerLabel(speaker: Speaker): string {
  if (speaker === 'reason') return 'La Razon';
  if (speaker === 'emotion') return 'La Emocion';
  return 'Subconsciente';
}

function describeCell(cell: number, playerHere: boolean, shadowHere: boolean): string {
  if (shadowHere) return 'sombra en celda';
  if (playerHere) return 'jugador en celda';
  if (cell === 1) return 'obstaculo en celda';
  if (cell === 2) return 'objeto en celda';
  if (cell === 3) return 'evento en celda';
  return 'suelo en celda';
}

function samePosition(first: Position, second: Position): boolean {
  return first.x === second.x && first.y === second.y;
}
