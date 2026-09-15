import { useEffect, useRef, useState } from 'react';
import type { Direction, GameActionRequest, GameState, MemoryCinematic, PlayerRole, Position } from '@en-blanco/shared';
import { SceneRenderer } from './components/SceneRenderer';
import { PlayerAvatar } from './components/PlayerAvatar';
import {
  ensureAudioStarted,
  isAudioMuted,
  playCarCrashSound,
  playClickSound,
  playEnemySound,
  playGlassShatterSound,
  playHeartbeatSound,
  playDefeatSound,
  playMemorySound,
  playRainSound,
  playStepSound,
  playVoiceBlip,
  setAudioMuted,
  startAmbientMusic,
  startHorrorMusic,
  stopAmbientMusic,
  stopHorrorMusic,
  stopRainSound,
} from './utils/audio';

type GameStage = 'menu' | 'controls' | 'cinematic' | 'playing' | 'memory' | 'gameover' | 'victory';

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
  const [activeMemory, setActiveMemory] = useState<MemoryCinematic | null>(null);
  const [memoryStep, setMemoryStep] = useState(0);
  const [victoryStep, setVictoryStep] = useState(0);
  const [muted, setMuted] = useState(isAudioMuted());
  const [playerDirections, setPlayerDirections] = useState<Record<PlayerRole, Direction>>({ reason: 'down', emotion: 'down' });
  const [shadowDirection, setShadowDirection] = useState<Direction>('down');
  const latestState = useRef<GameState | null>(null);
  const latestStage = useRef<GameStage>('menu');
  const lastSeenMemoryId = useRef<string | null>(null);
  const lastKeyTime = useRef<Record<string, number>>({});

  useEffect(() => {
    latestState.current = gameState;
  }, [gameState?.logs]);

  useEffect(() => {
    latestStage.current = gameStage;
  }, [gameStage]);

  useEffect(() => {
    void loadGameState();
  }, []);

  useEffect(() => {
    if (!gameState) return;
    if (latestStage.current === 'memory') return;
    if (gameState.gameWon) {
      setVictoryStep(0);
      setGameStage('victory');
    }
    if (gameState.gameOver) setGameStage('gameover');
  }, [gameState]);

  useEffect(() => {
    if (gameStage === 'gameover') playDefeatSound();
  }, [gameStage]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const currentStage = latestStage.current;

      if (currentStage === 'cinematic' && event.key === 'Enter') {
        event.preventDefault();
        setGameStage('playing');
        return;
      }

      if (currentStage === 'memory' && event.code === 'Space') {
        event.preventDefault();
        advanceMemoryCinematic();
        return;
      }

      if (currentStage === 'victory' && event.code === 'Space') {
        event.preventDefault();
        advanceVictoryCinematic();
        return;
      }

      if (currentStage !== 'playing') return;

      if (event.key.toLowerCase() === 'q') {
        event.preventDefault();
        void sendDistraction('reason');
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        void sendDistraction('emotion');
        return;
      }

      const binding = keyBindings[event.key] ?? keyBindings[event.key.toLowerCase()];
      const currentState = latestState.current;
      if (!binding || !currentState || currentState.gameOver || currentState.gameWon) return;

      const now = Date.now();
      const cooldownKey = `${binding.role}-${binding.direction}`;
      if (now - (lastKeyTime.current[cooldownKey] ?? 0) < cooldownMs) return;

      lastKeyTime.current[cooldownKey] = now;
      event.preventDefault();
      setPlayerDirections((current) => ({ ...current, [binding.role]: binding.direction }));
      void sendAction(binding.role, binding.direction);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMemory, memoryStep, gameState?.gameWon]);

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
    await ensureAudioStarted();
    stopAmbientMusic();
    startHorrorMusic();
    playClickSound();
    await resetGame();
    lastSeenMemoryId.current = null;
    setGameStage('cinematic');
  }

  async function sendAction(role: PlayerRole, direction: Direction): Promise<void> {
    const payload: GameActionRequest = { role, actionType: 'move', direction };
    await submitAction(payload);
  }

  async function sendDistraction(role: PlayerRole): Promise<void> {
    const payload: GameActionRequest = { role, actionType: 'distract' };
    await submitAction(payload);
  }

  async function submitAction(payload: GameActionRequest): Promise<void> {
    const previousState = latestState.current;
    try {
      const response = await fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const nextState = (await response.json()) as GameState;
      setGameState(nextState);
      setError('');
      const shadowMovement = getMovementDirection(previousState?.shadowPos, nextState.shadowPos);
      if (shadowMovement) setShadowDirection(shadowMovement);
      if (payload.actionType === 'move' && didPlayerMove(previousState, nextState, payload.role)) {
        playStepSound();
      }
      if (nextState.enemyMoved) {
        playEnemySound();
      }
      if (didTriggerMemorySound(previousState, nextState)) {
        playMemorySound();
      }
      if (nextState.lastMemory && nextState.lastMemory.id !== lastSeenMemoryId.current) {
        lastSeenMemoryId.current = nextState.lastMemory.id;
        setActiveMemory(nextState.lastMemory);
        setMemoryStep(0);
        setGameStage('memory');
      }
    } catch {
      setError('La accion no llego al backend.');
    }
  }

  async function resetGame(): Promise<void> {
    const response = await fetch('/api/game/reset', { method: 'POST' });
    const nextState = (await response.json()) as GameState;
    setGameState(nextState);
    setActiveMemory(null);
    setMemoryStep(0);
    setVictoryStep(0);
    setPlayerDirections({ reason: 'down', emotion: 'down' });
    setShadowDirection('down');
    setError('');
  }

  function advanceMemoryCinematic(): void {
    playClickSound();
    if (!activeMemory) {
      setGameStage('playing');
      return;
    }

    if (memoryStep < activeMemory.textSteps.length - 1) {
      setMemoryStep((current) => current + 1);
      return;
    }

    setActiveMemory(null);
    setMemoryStep(0);
    setGameStage(gameState?.gameWon ? 'victory' : 'playing');
  }

  function advanceVictoryCinematic(): void {
    playClickSound();
    setVictoryStep((current) => Math.min(current + 1, 3));
  }

  async function returnToMenu(): Promise<void> {
    playClickSound();
    await resetGame();
    lastSeenMemoryId.current = null;
    stopHorrorMusic();
    startAmbientMusic();
    setGameStage('menu');
  }

  function toggleMute(): void {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setAudioMuted(nextMuted);
    if (!nextMuted) {
      void ensureAudioStarted().then(() => {
        if (gameStage === 'menu' || gameStage === 'controls') startAmbientMusic();
        else startHorrorMusic();
      });
      playClickSound();
    }
  }

  if (gameStage === 'menu') {
    return <StartScreen error={error} onStart={() => void startStory()} onControls={() => { void ensureAudioStarted().then(() => startAmbientMusic()); playClickSound(); setGameStage('controls'); }} />;
  }

  if (gameStage === 'controls') {
    return <ControlsScreen onBack={() => { playClickSound(); setGameStage('menu'); }} />;
  }

  if (gameStage === 'cinematic') {
    return <CinematicScreen onSkip={() => { playClickSound(); setGameStage('playing'); }} />;
  }

  if (!gameState) {
    return <main className="loading">{error || 'Cargando En Blanco...'}</main>;
  }

  const floatingMessage = error || getLockMessage(gameState);

  return (
    <main className="app-shell">
      <Hud gameState={gameState} muted={muted} onMuteToggle={toggleMute} onReset={() => void startStory()} />
      <section className="split-screen">
        <PlayerPanel
          title="La Razon"
          role="reason"
          theme="reason"
          grid={gameState.reasonGrid}
          position={gameState.reasonPos}
          shadowPos={gameState.shadowPos}
           enemyMoved={gameState.enemyMoved}
           enemyTargetPosition={gameState.enemyTargetPosition}
           direction={playerDirections.reason}
           shadowDirection={shadowDirection}
        />
        <PlayerPanel
          title="La Emocion"
          role="emotion"
          theme="emotion"
          grid={gameState.emotionGrid}
          position={gameState.emotionPos}
          shadowPos={gameState.shadowPos}
           enemyMoved={gameState.enemyMoved}
           enemyTargetPosition={gameState.enemyTargetPosition}
           direction={playerDirections.emotion}
           shadowDirection={shadowDirection}
        />
      </section>

      <LogPanel logs={gameState.logs} />

      {floatingMessage && <FloatingMessage text={floatingMessage} />}

      {gameStage === 'memory' && activeMemory && (
        <MemoryCinematicOverlay memory={activeMemory} step={memoryStep} onContinue={advanceMemoryCinematic} />
      )}

      {(gameStage === 'gameover' || gameStage === 'victory') && (
        gameStage === 'victory'
          ? <VictoryCinematic step={victoryStep} onNext={advanceVictoryCinematic} onMenu={() => void returnToMenu()} />
          : <EndingScreen defeatedBy={gameState.defeatedBy} onRetry={() => void startStory()} onMenu={() => void returnToMenu()} />
      )}
    </main>
  );
}

interface StartScreenProps {
  error: string;
  onStart: () => void;
  onControls: () => void;
}

function StartScreen({ error, onStart, onControls }: StartScreenProps) {
  return (
    <main className="start-screen">
      <section className="start-window" aria-label="Pantalla de inicio">
        <p className="start-kicker">RPG tactico narrativo</p>
        <h1>EN BLANCO</h1>
        <p className="start-subtitle">Un misterio en la psique dividida</p>
        <nav className="start-menu" aria-label="Menu principal">
          <button onClick={onStart}>Comenzar Historia</button>
          <button onClick={onControls}>Controles e Instrucciones</button>
        </nav>
        {error && <p className="start-error">{error}</p>}
      </section>
    </main>
  );
}

interface ControlsScreenProps {
  onBack: () => void;
}

function ControlsScreen({ onBack }: ControlsScreenProps) {
  return (
    <main className="controls-screen">
      <section className="controls-panel controls-reason" aria-label="Controles Jugador 1 La Razon">
        <p className="start-kicker">Jugador 1 - La Razon</p>
        <h1>WASD</h1>
        <div className="keypad wasd-pad" aria-hidden="true">
          <span>W</span>
          <span>A</span>
          <span>S</span>
          <span>D</span>
        </div>
        <p>Resuelve acertijos, busca llaves logicas y desbloquea el camino de La Emocion.</p>
        <strong>Q: Grito / Distraccion logica</strong>
      </section>
      <section className="controls-panel controls-emotion" aria-label="Controles Jugador 2 La Emocion">
        <p className="start-kicker">Jugador 2 - La Emocion</p>
        <h1>FLECHAS</h1>
        <div className="keypad arrow-pad" aria-hidden="true">
          <span>↑</span>
          <span>←</span>
          <span>↓</span>
          <span>→</span>
        </div>
        <p>Recolecta recuerdos, activa interruptores emocionales y distrae a la Sombra.</p>
        <strong>ENTER: Grito / Distraccion emocional</strong>
      </section>
      <button className="back-menu-button" onClick={onBack}>Volver al Menu Principal</button>
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
  muted: boolean;
  onMuteToggle: () => void;
  onReset: () => void;
}

function Hud({ gameState, muted, onMuteToggle, onReset }: HudProps) {
  const blocks = Array.from({ length: 10 }, (_, index) => index < Math.ceil(gameState.sanity / 10));
  return (
    <header className="hud">
      <div className="sanity-panel">
        <span>CORDURA DE LA MENTE</span>
        <strong>{gameState.sanity} / 100 HP</strong>
        <div className="hp-blocks" aria-label={`Cordura ${gameState.sanity} de 100`}>
          {blocks.map((active, index) => <i className={active ? 'active' : ''} key={`hp-${index}`} />)}
        </div>
      </div>
      <div className="memory-percent">PROGRESS DE MEMORIA: {gameState.memoryProgress}%</div>
      <div className="coop-status">{getHudStatus(gameState)}</div>
      <button className="mute-button" onClick={onMuteToggle} aria-label={muted ? 'Activar audio' : 'Silenciar audio'}>{muted ? '🔇' : '🔊'}</button>
      <button className="reset-button" onClick={onReset}>Reset</button>
    </header>
  );
}

interface MemoryCinematicOverlayProps {
  memory: MemoryCinematic;
  step: number;
  onContinue: () => void;
}

function MemoryCinematicOverlay({ memory, step, onContinue }: MemoryCinematicOverlayProps) {
  const currentText = memory.textSteps[step] ?? memory.textSteps[0];
  const [visibleText, setVisibleText] = useState('');
  const done = step >= memory.textSteps.length - 1;
  const stepLabel = `Paso ${step + 1} de ${memory.textSteps.length}`;
  const speakerName = getMemorySpeakerName(memory, step);
  const scene = memory.scenes[step] ?? memory.scenes[0] ?? 'school_classroom';

  useEffect(() => {
    setVisibleText('');
    if (scene === 'rain_car' || scene === 'rain_street') {
      playCarCrashSound();
      playRainSound();
    } else {
      stopRainSound();
    }
    if (scene === 'crash_detail') playCarCrashSound();
    if (scene === 'mirror_shards') playGlassShatterSound();

    let characterIndex = 0;
    const intervalId = window.setInterval(() => {
      characterIndex += 1;
      setVisibleText(currentText.slice(0, characterIndex));
      const currentCharacter = currentText[characterIndex - 1];
      if (currentCharacter && currentCharacter.trim()) playVoiceBlip(memory.discoveredBy);
      if (characterIndex >= currentText.length) window.clearInterval(intervalId);
    }, 28);

    return () => {
      window.clearInterval(intervalId);
      if (scene === 'rain_car' || scene === 'rain_street') stopRainSound();
    };
  }, [currentText, memory.discoveredBy, scene]);

  return (
    <section className="memory-cinematic" role="dialog" aria-modal="true" aria-label={memory.title}>
      <article className="memory-window">
        <h2>{memory.title}</h2>
        <p className="memory-step-label">{stepLabel}</p>
        <SceneRenderer scene={scene} />
        <div className="memory-textbox">
          <div className="memory-speaker-row">
            <PlayerAvatar portrait role={memory.discoveredBy} label={speakerName} />
            <strong>{speakerName}</strong>
          </div>
          <p key={`${memory.id}-${step}`}>{visibleText}</p>
          <button onClick={onContinue}>{done ? 'Guardar Recuerdo y Continuar [ESPACIO]' : 'Siguiente [ESPACIO]'}</button>
        </div>
      </article>
    </section>
  );
}

function getMemorySpeakerName(memory: MemoryCinematic, step: number): string {
  if (step >= 2) return memory.title.split(':')[0] ?? 'RECUERDO';
  return memory.discoveredBy === 'reason' ? 'LA RAZON' : 'LA EMOCION';
}

interface FloatingMessageProps {
  text: string;
}

function FloatingMessage({ text }: FloatingMessageProps) {
  return (
    <section className="floating-message" aria-live="polite">
      {text}
    </section>
  );
}

interface LogPanelProps {
  logs: string[];
}

function LogPanel({ logs }: LogPanelProps) {
  return (
    <aside className="log-panel" aria-label="Registro narrativo" aria-live="polite">
      <strong>REGISTRO DE LA MENTE</strong>
      <p>{logs[0] ?? 'La mente espera una decision.'}</p>
    </aside>
  );
}

interface EndingScreenProps {
  defeatedBy: PlayerRole | null;
  onRetry: () => void;
  onMenu: () => void;
}

function EndingScreen({ defeatedBy, onRetry, onMenu }: EndingScreenProps) {
  const reasonDefeat = defeatedBy === 'reason';
  const title = reasonDefeat
      ? 'FINAL TRAGICO: PARALISIS POR ANALISIS'
      : 'FINAL TRAGICO: DESBORDAMIENTO DE TRAUMA';
  const text = reasonDefeat
      ? 'La mente se ahogo en la logica sin empatia. Cada posibilidad se congelo hasta impedir cualquier salida.'
      : 'El dolor destruyo el juicio. La Emocion ardia tan fuerte que la Sombra encontro una puerta abierta.';
  const imageSrc = reasonDefeat ? '/cinematics/defeat_reason.png' : '/cinematics/defeat_emotion.png';

  return (
    <section className={`ending-screen ${reasonDefeat ? 'ending-reason' : 'ending-emotion'}`} role="dialog" aria-modal="true">
      <div className="ending-art">
        <img src={imageSrc} alt={title} className="ending-image" />
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="ending-actions">
        <button onClick={onRetry}>Reintentar Partida</button>
        <button onClick={onMenu}>Menu Principal</button>
      </div>
    </section>
  );
}

interface VictoryCinematicProps {
  step: number;
  onNext: () => void;
  onMenu: () => void;
}

const victorySteps = [
  {
    title: 'El Repaso',
    text: 'Los cuatro recuerdos clave se reunen en el centro de la mente.',
    className: 'victory-montage',
    image: '/cinematics/victory_repaso.png',
  },
  {
    title: 'El Cliffhanger',
    text: 'Ahora recuerdo todo... la discusion, el frenazo, y la sombra que nos saco de la carretera no era un monstruo, era...',
    className: 'victory-cliffhanger',
    image: '/cinematics/victory_cliffhanger.png',
  },
  {
    title: 'Corte a Negro',
    text: '',
    className: 'victory-blackout',
    image: null,
  },
  {
    title: 'EN BLANCO - CAPITULO 1 COMPLETADO',
    text: 'CAPITULO 2: PROXIMAMENTE',
    className: 'victory-title-card',
    image: null,
  },
] as const;

function VictoryCinematic({ step, onNext, onMenu }: VictoryCinematicProps) {
  const current = victorySteps[step] ?? victorySteps[3];
  const finalStep = step >= victorySteps.length - 1;

  useEffect(() => {
    if (current.className !== 'victory-blackout') return;

    playHeartbeatSound();
    const heartbeatId = window.setInterval(playHeartbeatSound, 1400);
    return () => window.clearInterval(heartbeatId);
  }, [current.className]);

  return (
    <section className={`victory-cinematic ${current.className}`} role="dialog" aria-modal="true">
      <div className="victory-art">
        {current.image && <img src={current.image} alt={current.title} className="victory-image" />}
      </div>
      <h2>{current.title}</h2>
      {current.text && <p>{current.text}</p>}
      {finalStep ? (
        <button onClick={onMenu}>Volver al Menu Principal</button>
      ) : (
        <button onClick={onNext}>Siguiente [ESPACIO]</button>
      )}
    </section>
  );
}

interface PlayerPanelProps {
  title: string;
  role: PlayerRole;
  theme: 'reason' | 'emotion';
  grid: number[][];
  position: Position;
  shadowPos: Position;
  enemyMoved: boolean;
  enemyTargetPosition: Position;
  direction: Direction;
  shadowDirection: Direction;
}

function PlayerPanel(props: PlayerPanelProps) {
  return (
    <section className={`panel ${props.theme}`} aria-label={props.title}>
      <div className="board" style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}>
        {props.grid.flatMap((row, y) => row.map((cell, x) => {
          const position = { x, y };
          const playerHere = samePosition(position, props.position);
          const shadowHere = samePosition(position, props.shadowPos);
          const enemyPulse = props.enemyMoved && samePosition(position, props.enemyTargetPosition);
          return (
            <div
              className={`cell ${props.theme}-tile cell-${cell} ${playerHere ? 'player-here' : ''} ${shadowHere ? 'shadow-here' : ''} ${enemyPulse ? 'enemy-moved' : ''}`}
              key={`${props.role}-${x}-${y}`}
              aria-label={`${props.title} ${describeCell(cell, playerHere, shadowHere)} ${x},${y}`}
            >
              {playerHere && (
                <div className="avatar-cell-container">
                  <PlayerAvatar role={props.role} label={props.title} direction={props.direction} />
                </div>
              )}
              {shadowHere && (
                <div className="avatar-cell-container">
                  <PlayerAvatar role="shadow" label="La Sombra" direction={props.shadowDirection} />
                </div>
              )}
            </div>
          );
        }))}
      </div>
    </section>
  );
}

function didTriggerMemorySound(previousState: GameState | null, nextState: GameState): boolean {
  if (nextState.lastMemory) return true;
  if (!previousState) return false;
  return nextState.reasonKeys > previousState.reasonKeys || nextState.emotionSwitches !== previousState.emotionSwitches;
}

function didPlayerMove(previousState: GameState | null, nextState: GameState, role: PlayerRole): boolean {
  if (!previousState) return false;
  const previousPosition = role === 'reason' ? previousState.reasonPos : previousState.emotionPos;
  const nextPosition = role === 'reason' ? nextState.reasonPos : nextState.emotionPos;
  return !samePosition(previousPosition, nextPosition);
}

function getLockMessage(gameState: GameState): string {
  if (gameState.reasonMemoryLock) return 'Memoria de La Razon registrada. Esperando a La Emocion...';
  if (gameState.emotionMemoryLock) return 'Memoria de La Emocion registrada. Esperando a La Razon...';
  return '';
}

function getHudStatus(gameState: GameState): string {
  if (gameState.reasonMemoryLock) return 'Bloqueo Co-op: espera La Emocion';
  if (gameState.emotionMemoryLock) return 'Bloqueo Co-op: espera La Razon';
  if (gameState.doorsLocked) return 'Barreras Co-op activas';
  return 'Co-op sincronizado';
}

function describeCell(cell: number, playerHere: boolean, shadowHere: boolean): string {
  if (shadowHere) return 'sombra en celda';
  if (playerHere) return 'jugador en celda';
  if (cell === 1) return 'obstaculo en celda';
  if (cell === 2) return 'objeto en celda';
  if (cell === 3) return 'evento en celda';
  if (cell === 4) return 'llave logica en celda';
  if (cell === 5) return 'interruptor emocional en celda';
  if (cell === 6) return 'barrera cooperativa en celda';
  return 'suelo en celda';
}

function samePosition(first: Position, second: Position): boolean {
  return first.x === second.x && first.y === second.y;
}

function getMovementDirection(previous: Position | undefined, next: Position): Direction | null {
  if (!previous || samePosition(previous, next)) return null;
  if (next.x > previous.x) return 'right';
  if (next.x < previous.x) return 'left';
  if (next.y > previous.y) return 'down';
  return 'up';
}
