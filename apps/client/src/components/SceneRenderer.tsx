import { useEffect, useState } from 'react';

export type MemorySceneKey = 'school_classroom' | 'school_hallway' | 'rain_car' | 'rain_street' | 'crash_detail' | 'mirror_shards';

interface SceneRendererProps {
  scene: string;
}

const sceneImageCandidates: Record<MemorySceneKey, string[]> = {
  school_classroom: ['/images/school.png', '/images/school_classroom.png'],
  school_hallway: ['/images/school.png', '/images/school_hallway.png'],
  rain_car: ['/images/rain.png', '/images/rain_car.png'],
  rain_street: ['/images/rain.png', '/images/rain_street.png'],
  crash_detail: ['/images/mirror.png', '/images/crash_detail.png'],
  mirror_shards: ['/images/mirror.png', '/images/mirror_shards.png'],
};

export function SceneRenderer({ scene }: SceneRendererProps) {
  const sceneKey = toMemorySceneKey(scene);
  const candidates = sceneImageCandidates[sceneKey];
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setCandidateIndex(0);
    setImageLoaded(false);
  }, [sceneKey]);

  function handleImageError(): void {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((current) => current + 1);
      return;
    }
    setImageLoaded(false);
  }

  return (
    <figure className={`memory-illustration scene-${sceneKey}`} aria-hidden="true">
      {!imageLoaded && candidateIndex < candidates.length && (
        <img
          className="scene-image-preload"
          src={candidates[candidateIndex]}
          alt=""
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />
      )}
      {imageLoaded ? (
        <span className="scene-image" style={{ backgroundImage: `url('${candidates[candidateIndex]}')` }} />
      ) : (
        <svg viewBox="0 0 320 180" role="img">
          {(sceneKey === 'school_classroom' || sceneKey === 'school_hallway') && <ClassroomScene />}
          {(sceneKey === 'rain_car' || sceneKey === 'rain_street' || sceneKey === 'crash_detail') && <RoadCrashScene />}
          {sceneKey === 'mirror_shards' && <SplitMindScene />}
        </svg>
      )}
    </figure>
  );
}

function toMemorySceneKey(scene: string): MemorySceneKey {
  if (scene === 'school_classroom') return 'school_classroom';
  if (scene === 'school_hallway') return 'school_hallway';
  if (scene === 'rain_car') return 'rain_car';
  if (scene === 'rain_street') return 'rain_street';
  if (scene === 'crash_detail') return 'crash_detail';
  return 'mirror_shards';
}

function ClassroomScene() {
  return (
    <>
      <defs>
        <linearGradient id="classroom-wall" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f1c40f" />
          <stop offset="0.55" stopColor="#b86b28" />
          <stop offset="1" stopColor="#51311f" />
        </linearGradient>
        <linearGradient id="classroom-light" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f1c40f" stopOpacity="0.72" />
          <stop offset="1" stopColor="#e67e22" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="#2b1e1a" />
      <rect width="320" height="112" fill="url(#classroom-wall)" />
      <rect x="0" y="0" width="70" height="118" fill="#30485a" />
      <g fill="#0e1f2b">
        <rect x="0" y="12" width="70" height="5" />
        <rect x="0" y="30" width="70" height="5" />
        <rect x="0" y="48" width="70" height="5" />
        <rect x="0" y="66" width="70" height="5" />
        <rect x="0" y="84" width="70" height="5" />
        <rect x="14" y="0" width="5" height="118" />
        <rect x="46" y="0" width="5" height="118" />
      </g>
      <polygon points="50,20 320,116 320,180 114,180" fill="url(#classroom-light)" />
      <polygon points="0,34 270,128 250,142 0,58" fill="#f1c40f" opacity="0.18" />
      <polygon points="0,70 320,160 320,180 0,112" fill="#e67e22" opacity="0.16" />
      <rect x="0" y="112" width="320" height="68" fill="#6d3e20" />
      <g fill="#4d2d18">
        <rect x="0" y="132" width="320" height="4" />
        <rect x="0" y="150" width="320" height="3" />
        <rect x="0" y="168" width="320" height="3" />
      </g>
      <g opacity="0.82">
        <rect x="92" y="70" width="44" height="38" fill="#1c2024" />
        <rect x="102" y="52" width="22" height="22" fill="#cf9878" />
        <rect x="98" y="48" width="28" height="11" fill="#171317" />
        <rect x="80" y="106" width="72" height="9" fill="#8b5528" />
        <rect x="88" y="115" width="7" height="42" fill="#3a2114" />
        <rect x="138" y="115" width="7" height="42" fill="#3a2114" />
        <rect x="230" y="74" width="40" height="34" fill="#52635d" />
        <rect x="240" y="56" width="22" height="22" fill="#d2a080" />
        <rect x="236" y="52" width="28" height="10" fill="#161316" />
        <rect x="218" y="108" width="70" height="9" fill="#8b5528" />
        <rect x="226" y="117" width="7" height="38" fill="#3a2114" />
        <rect x="274" y="117" width="7" height="38" fill="#3a2114" />
      </g>
      <g>
        <ellipse cx="160" cy="160" rx="58" ry="12" fill="#1a0e0b" opacity="0.35" />
        <rect x="126" y="80" width="70" height="68" fill="#c0392b" />
        <rect x="118" y="91" width="18" height="44" fill="#a92f25" />
        <rect x="190" y="91" width="18" height="44" fill="#a92f25" />
        <rect x="138" y="74" width="46" height="34" fill="#d99b76" />
        <rect x="133" y="44" width="58" height="46" fill="#2b160d" />
        <rect x="128" y="55" width="20" height="36" fill="#2b160d" />
        <rect x="176" y="54" width="20" height="40" fill="#2b160d" />
        <rect x="144" y="50" width="34" height="12" fill="#3b2111" />
        <rect x="145" y="82" width="12" height="8" fill="#fff1c9" />
        <rect x="168" y="82" width="12" height="8" fill="#fff1c9" />
        <rect x="149" y="84" width="5" height="6" fill="#4b2c1f" />
        <rect x="171" y="84" width="5" height="6" fill="#4b2c1f" />
        <rect x="142" y="78" width="18" height="3" fill="#2b160d" />
        <rect x="166" y="78" width="18" height="3" fill="#2b160d" />
        <rect x="157" y="95" width="12" height="4" fill="#a84d42" />
        <rect x="152" y="104" width="23" height="5" fill="#7f271f" />
        <rect x="135" y="108" width="14" height="12" fill="#d4af37" />
        <rect x="177" y="108" width="14" height="12" fill="#d4af37" />
        <rect x="146" y="112" width="34" height="5" fill="#d4af37" />
        <rect x="150" y="148" width="24" height="12" fill="#d99b76" />
        <rect x="136" y="146" width="60" height="8" fill="#8b5528" />
      </g>
      <rect x="0" y="0" width="320" height="180" fill="none" stroke="#120c0a" strokeWidth="8" />
    </>
  );
}

function RoadCrashScene() {
  return (
    <>
      <rect width="320" height="180" fill="#07121f" />
      <rect x="0" y="0" width="320" height="88" fill="#1a252f" />
      <g stroke="#6fb7ff" strokeWidth="2" opacity="0.48">
        <line x1="22" y1="0" x2="0" y2="82" />
        <line x1="70" y1="0" x2="34" y2="118" />
        <line x1="128" y1="0" x2="82" y2="144" />
        <line x1="198" y1="0" x2="156" y2="146" />
        <line x1="272" y1="0" x2="232" y2="136" />
        <line x1="318" y1="8" x2="278" y2="150" />
      </g>
      <polygon points="60,180 130,76 202,76 296,180" fill="#111a25" />
      <polygon points="146,78 152,180 170,180 166,78" fill="#d4af37" opacity="0.75" />
      <g fill="#2980b9" opacity="0.34">
        <ellipse cx="64" cy="152" rx="40" ry="8" />
        <ellipse cx="224" cy="158" rx="58" ry="10" />
        <ellipse cx="170" cy="126" rx="28" ry="6" />
      </g>
      <rect x="214" y="92" width="88" height="7" fill="#bdc3c7" />
      <rect x="224" y="99" width="10" height="31" fill="#95a5a6" />
      <rect x="280" y="99" width="10" height="31" fill="#95a5a6" />
      <g transform="translate(122 88) rotate(-12)">
        <rect x="0" y="26" width="96" height="34" fill="#202a36" stroke="#05070c" strokeWidth="5" />
        <rect x="18" y="8" width="48" height="24" fill="#32475c" stroke="#05070c" strokeWidth="4" />
        <rect x="24" y="13" width="18" height="14" fill="#6fb7ff" opacity="0.52" />
        <rect x="48" y="13" width="14" height="14" fill="#1a252f" />
        <rect x="8" y="56" width="18" height="18" fill="#05070c" />
        <rect x="70" y="56" width="18" height="18" fill="#05070c" />
        <rect className="crash-light" x="-8" y="34" width="14" height="8" fill="#ff2d55" />
        <rect x="88" y="34" width="14" height="8" fill="#f8c66a" />
      </g>
      <g fill="#b8c3c9" opacity="0.42">
        <ellipse cx="206" cy="84" rx="25" ry="10" />
        <ellipse cx="222" cy="76" rx="16" ry="7" />
        <ellipse cx="238" cy="70" rx="12" ry="5" />
      </g>
      <rect x="0" y="0" width="320" height="180" fill="none" stroke="#05070c" strokeWidth="8" />
    </>
  );
}

function SplitMindScene() {
  return (
    <>
      <rect width="160" height="180" fill="#081c30" />
      <rect x="160" width="160" height="180" fill="#2b0617" />
      <g stroke="#7bd5ff" strokeWidth="1" opacity="0.34">
        <path d="M0 24 H160 M0 48 H160 M0 72 H160 M0 96 H160 M0 120 H160 M0 144 H160" />
        <path d="M24 0 V180 M48 0 V180 M72 0 V180 M96 0 V180 M120 0 V180 M144 0 V180" />
      </g>
      <g fill="#7bd5ff" opacity="0.85">
        <rect x="20" y="20" width="44" height="4" />
        <rect x="30" y="36" width="78" height="4" />
        <rect x="18" y="52" width="58" height="4" />
        <rect x="72" y="126" width="52" height="4" />
      </g>
      <g fill="#ff2d55" opacity="0.85">
        <polygon points="220,18 240,64 214,62" />
        <polygon points="286,50 272,96 306,84" />
        <polygon points="204,130 238,116 226,168" />
        <polygon points="260,118 296,134 252,148" />
      </g>
      <path d="M160 28 C105 34 78 76 86 124 C94 166 132 174 160 166 Z" fill="#d7b38c" />
      <path d="M160 28 C215 34 242 76 234 124 C226 166 188 174 160 166 Z" fill="#9a315c" />
      <path d="M116 42 C132 24 154 32 160 30 L160 60 C146 54 134 56 116 42 Z" fill="#28140d" />
      <path d="M160 30 C178 26 200 34 206 54 C190 52 174 56 160 62 Z" fill="#3b1024" />
      <rect x="125" y="84" width="20" height="9" fill="#061827" />
      <rect x="176" y="84" width="20" height="9" fill="#ffccd6" />
      <rect x="130" y="86" width="7" height="6" fill="#7bd5ff" />
      <rect x="181" y="86" width="7" height="6" fill="#58111f" />
      <rect x="147" y="116" width="27" height="6" fill="#3a1022" />
      <line x1="160" y1="28" x2="160" y2="168" stroke="#fff7d6" strokeWidth="3" />
      <g stroke="#fff7d6" strokeWidth="2" opacity="0.8">
        <line x1="116" y1="56" x2="140" y2="78" />
        <line x1="204" y1="56" x2="184" y2="82" />
        <line x1="112" y1="132" x2="144" y2="118" />
        <line x1="208" y1="132" x2="178" y2="118" />
      </g>
      <rect x="0" y="0" width="320" height="180" fill="none" stroke="#05070c" strokeWidth="8" />
    </>
  );
}
