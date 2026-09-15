type BrowserAudioContext = typeof AudioContext;

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: BrowserAudioContext;
}

interface ToneOptions {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
  start?: number;
}

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientGain: GainNode | null = null;
const ambientOscillators: OscillatorNode[] = [];
let rainSource: AudioBufferSourceNode | null = null;
let rainGain: GainNode | null = null;
let muted = false;
let emotionBlipOffset = 0;

export async function ensureAudioStarted(): Promise<void> {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === 'suspended') await context.resume();
}

export function isAudioMuted(): boolean {
  return muted;
}

export function setAudioMuted(nextMuted: boolean): void {
  muted = nextMuted;
  const context = getAudioContext();
  if (!context || !masterGain) return;
  masterGain.gain.setTargetAtTime(nextMuted ? 0.0001 : 1, context.currentTime, 0.02);
}

export function startAmbientMusic(): void {
  const context = getAudioContext();
  if (!context || ambientOscillators.length > 0) return;

  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, context.currentTime);

  ambientGain = context.createGain();
  ambientGain.gain.setValueAtTime(0.0001, context.currentTime);
  ambientGain.gain.exponentialRampToValueAtTime(0.03, context.currentTime + 1.2);

  [110, 164].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.detune.setValueAtTime(index === 0 ? -4 : 3, context.currentTime);
    oscillator.connect(filter);
    oscillator.start();
    ambientOscillators.push(oscillator);
  });

  filter.connect(ambientGain);
  ambientGain.connect(getMasterGain(context));
}

export function playVoiceBlip(role: 'reason' | 'emotion'): void {
  const context = getAudioContext();
  if (!context || muted) return;
  const variation = role === 'reason' ? 0 : Math.sin(emotionBlipOffset) * 28 + (emotionBlipOffset % 3) * 12;
  emotionBlipOffset += 1;
  playTone({
    frequency: role === 'reason' ? 520 : 440 + variation,
    duration: 0.035,
    volume: 0.035,
    type: 'square',
  });
}

export function playCarCrashSound(): void {
  const context = getAudioContext();
  if (!context || muted) return;
  const start = context.currentTime;
  const noise = context.createBufferSource();
  noise.buffer = createNoiseBuffer(context, 0.42);

  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, start);
  filter.frequency.exponentialRampToValueAtTime(120, start + 0.36);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.18, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(getMasterGain(context));
  noise.start(start);
  noise.stop(start + 0.43);

  playTone({ frequency: 40, duration: 0.32, volume: 0.12, type: 'sine', start });
}

export function playRainSound(): void {
  const context = getAudioContext();
  if (!context || rainSource) return;

  const source = context.createBufferSource();
  source.buffer = createNoiseBuffer(context, 2);
  source.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1500, context.currentTime);
  filter.Q.setValueAtTime(0.8, context.currentTime);

  rainGain = context.createGain();
  rainGain.gain.setValueAtTime(muted ? 0.0001 : 0.035, context.currentTime);

  source.connect(filter);
  filter.connect(rainGain);
  rainGain.connect(getMasterGain(context));
  source.start();
  rainSource = source;
}

export function stopRainSound(): void {
  const context = getAudioContext();
  if (!context || !rainSource || !rainGain) return;
  rainGain.gain.setTargetAtTime(0.0001, context.currentTime, 0.04);
  rainSource.stop(context.currentTime + 0.18);
  rainSource = null;
  rainGain = null;
}

export function playGlassShatterSound(): void {
  const context = getAudioContext();
  if (!context || muted) return;
  const start = context.currentTime;
  [1480, 1220, 980, 760].forEach((frequency, index) => {
    const hitStart = start + index * 0.035;
    playDescendingShard(frequency, hitStart);
  });
}

export function playStepSound(): void {
  playTone({ frequency: 180, duration: 0.08, volume: 0.05, type: 'square' });
}

export function playMemorySound(): void {
  const start = getCurrentTime();
  playTone({ frequency: 520, duration: 0.1, volume: 0.07, type: 'square', start });
  playTone({ frequency: 780, duration: 0.14, volume: 0.07, type: 'square', start: start + 0.11 });
}

export function playEnemySound(): void {
  const start = getCurrentTime();
  playTone({ frequency: 82, duration: 0.12, volume: 0.08, type: 'sawtooth', start });
  playTone({ frequency: 62, duration: 0.16, volume: 0.06, type: 'sawtooth', start: start + 0.13 });
}

export function playClickSound(): void {
  playTone({ frequency: 900, duration: 0.035, volume: 0.045, type: 'square' });
}

function playDescendingShard(frequency: number, start: number): void {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(180, frequency * 0.38), start + 0.18);
  gain.gain.setValueAtTime(0.045, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
  oscillator.connect(gain);
  gain.connect(getMasterGain(context));
  oscillator.start(start);
  oscillator.stop(start + 0.22);
}

function playTone(options: ToneOptions): void {
  const context = getAudioContext();
  if (!context || muted) return;

  const start = options.start ?? context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = options.type;
  oscillator.frequency.setValueAtTime(options.frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(options.volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + options.duration);

  oscillator.connect(gain);
  gain.connect(getMasterGain(context));
  oscillator.start(start);
  oscillator.stop(start + options.duration + 0.02);
}

function createNoiseBuffer(context: AudioContext, duration: number): AudioBuffer {
  const sampleCount = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < sampleCount; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  return buffer;
}

function getCurrentTime(): number {
  return getAudioContext()?.currentTime ?? 0;
}

function getMasterGain(context: AudioContext): GainNode {
  if (masterGain) return masterGain;
  masterGain = context.createGain();
  masterGain.gain.setValueAtTime(muted ? 0.0001 : 1, context.currentTime);
  masterGain.connect(context.destination);
  return masterGain;
}

function getAudioContext(): AudioContext | null {
  if (audioContext) return audioContext;

  const AudioContextConstructor = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
  if (!AudioContextConstructor) return null;

  audioContext = new AudioContextConstructor();
  getMasterGain(audioContext);
  return audioContext;
}
