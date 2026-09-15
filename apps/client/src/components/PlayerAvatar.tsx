import { useEffect, useState } from 'react';
import type { Direction } from '@en-blanco/shared';

export type AvatarRole = 'reason' | 'emotion' | 'shadow';

const assetCandidates: Record<AvatarRole, string[]> = {
  reason: ['/sprites/sprite_razon.png', '/sprites/razon.png', '/razon.png', '/avatars/razon.png'],
  emotion: ['/sprites/emocion.png', '/sprites/sprite_emocion.png', '/emocion.png', '/avatars/emocion.png'],
  shadow: ['/sprites/sombra.png', '/sprites/sprite_sombra.png', '/sombra.png', '/avatars/sombra.png'],
};

const portraitCandidates: Record<AvatarRole, string[]> = {
  reason: ['/razon.png', '/avatars/razon.png', '/sprites/razon.png', '/sprites/sprite_razon.png'],
  emotion: ['/emocion.png', '/avatars/emocion.png', '/sprites/emocion.png', '/sprites/sprite_emocion.png'],
  shadow: ['/sombra.png', '/avatars/sombra.png', '/sprites/sombra.png', '/sprites/sprite_sombra.png'],
};

interface PlayerAvatarProps {
  role: AvatarRole;
  portrait?: boolean;
  label?: string;
  direction?: Direction;
}

export function PlayerAvatar({ role, portrait = false, label, direction = 'down' }: PlayerAvatarProps) {
  const candidates = portrait ? portraitCandidates[role] : assetCandidates[role];
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [assetLoaded, setAssetLoaded] = useState(portrait ? false : true);
  const assetPath = candidates[candidateIndex] ?? candidates[0];

  useEffect(() => {
    setCandidateIndex(0);
    setAssetLoaded(!portrait);
    let cancelled = false;

    function probeAsset(index: number): void {
      const path = candidates[index];
      if (!path || cancelled) return;
      const probe = new Image();
      probe.onload = () => {
        if (!cancelled) {
          setCandidateIndex(index);
          setAssetLoaded(true);
        }
      };
      probe.onerror = () => {
        if (index < candidates.length - 1) probeAsset(index + 1);
        else if (!cancelled) setAssetLoaded(false);
      };
      probe.src = path;
    }

    probeAsset(0);
    return () => {
      cancelled = true;
    };
  }, [candidates, portrait]);

  function handlePortraitError(): void {
    setAssetLoaded(false);
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((current) => current + 1);
      return;
    }
    setAssetLoaded(false);
  }

  return (
    <span className={`player-avatar player-avatar-${role} ${portrait ? 'player-avatar-portrait' : 'player-avatar-sprite'} ${assetLoaded ? 'has-asset' : 'asset-unavailable'}`} aria-label={label}>
      {assetLoaded && !portrait && (
        <div
          className="sprite-crop"
          style={{ backgroundImage: `url('${assetPath}')`, backgroundPosition: `${role === 'shadow' ? '10%' : '0%'} ${getDirectionPosition(direction)}` }}
        />
      )}
      {assetLoaded && portrait && <img className="portrait-image-element" src={assetPath} alt={label ?? role} onError={handlePortraitError} />}
    </span>
  );
}

function getDirectionPosition(direction: Direction): string {
  if (direction === 'left') return '33.333%';
  if (direction === 'up') return '66.667%';
  if (direction === 'right') return '100%';
  return '0%';
}
