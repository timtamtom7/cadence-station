import { useState } from 'react';
import './AmbientSounds.css';

const SOUNDS = [
  { key: 'none',     label: 'None',      icon: MuteIcon },
  { key: 'brownNoise', label: 'Brown Noise', icon: WaveIcon },
  { key: 'whiteNoise', label: 'White Noise', icon: WaveIcon },
  { key: 'cafe',     label: 'Café',      icon: CafeIcon },
  { key: 'rain',     label: 'Rain',       icon: RainIcon },
  { key: 'forest',   label: 'Forest',     icon: ForestIcon },
  { key: 'ocean',    label: 'Ocean',      icon: OceanIcon },
];

export function AmbientSounds({ selected, volume, onSoundChange, onVolumeChange }) {
  const [expanded, setExpanded] = useState(false);
  const currentSound = SOUNDS.find(s => s.key === selected) || SOUNDS[0];
  const CurrentIcon = currentSound.icon;

  return (
    <div className="ambient-sounds">
      <button
        className={`ambient-toggle ${selected !== 'none' ? 'active' : ''}`}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <CurrentIcon />
        <span>{currentSound.label}</span>
        <ChevronIcon open={expanded} />
      </button>

      {expanded && (
        <div className="ambient-panel">
          <div className="sound-grid">
            {SOUNDS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  className={`sound-option ${selected === s.key ? 'active' : ''}`}
                  onClick={() => onSoundChange(s.key)}
                >
                  <Icon />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {selected !== 'none' && (
            <div className="volume-control">
              <span className="volume-label">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="volume-slider"
                aria-label="Ambient sound volume"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MuteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3L4 6H1v4h3l4 3V3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M11 6.5a3 3 0 01-.5 5.5M13 5a5.5 5.5 0 01-1 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8c1-2 2-3 3-3s2 1 3 3 2 3 3 3 2-1 3-3 2-3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CafeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 6h7v5a3 3 0 01-3 3H7a3 3 0 01-3-3V6z" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M11 7h1a2 2 0 010 4h-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5 2c0 1 .5 2 1.5 2S8 3 8 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function RainIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l1 5M8 6l1 5M12 6l1 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M2 4h12a3 3 0 010 6H9l-1-2H3a2 2 0 010-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ForestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1l3 5H9l3-5M8 5l3 4H9l3-4M8 8l3 4H9l3-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function OceanIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 7c2-1 3-2 5-2s3 1 5 2 3 2 5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M1 10c2-1 3-2 5-2s3 1 5 2 3 2 5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M1 13c2-1 3-2 5-2s3 1 5 2 3 2 5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
