import { useState, useCallback } from 'react';
import { ALL_SOUNDS, SOUND_META } from '../../hooks/useAudio';
import './SoundMixer.css';

const DEFAULT_VOL = 0.5;

function SoundIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5" fill={color} opacity="0.25"/>
      <circle cx="7" cy="7" r="3" fill={color} opacity="0.6"/>
      <circle cx="7" cy="7" r="1.5" fill={color}/>
    </svg>
  );
}

export function SoundMixer({ activeSounds, onAddSound, onRemoveSound, onVolumeChange }) {
  const [expanded, setExpanded] = useState(false);
  const [soundLoadError, setSoundLoadError] = useState(null);

  // Sounds available to add (not yet active)
  const availableSounds = ALL_SOUNDS.filter((k) => !activeSounds[k]);

  const handleAddSound = useCallback((key) => {
    setSoundLoadError(null);
    try {
      onAddSound(key, DEFAULT_VOL);
    } catch (err) {
      setSoundLoadError(`Couldn't load "${SOUND_META[key]?.label || key}". Check your connection and try again.`);
    }
  }, [onAddSound]);

  const totalVolume = Object.values(activeSounds).reduce((acc, v) => acc + v, 0);
  const activeCount = Object.keys(activeSounds).length;

  return (
    <div className="sound-mixer">
      {/* Header row */}
      <button
        className={`mixer-toggle ${activeCount > 0 ? 'active' : ''}`}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="mixer-toggle-left">
          <WaveformIcon />
          <span className="mixer-toggle-label">
            {activeCount === 0
              ? 'Sound Mixer'
              : activeCount === 1
              ? `${Object.keys(activeSounds)[0] === 'none' ? 'Sound' : SOUND_META[Object.keys(activeSounds)[0]]?.label || 'Sound'}`
              : `${activeCount} sounds`}
          </span>
          {activeCount > 1 && (
            <span className="mixer-multi-indicator">
              {Object.keys(activeSounds).slice(0, 3).map((k) => (
                <span key={k} className="mixer-dot" style={{ background: SOUND_META[k]?.color || 'var(--color-accent)' }} />
              ))}
            </span>
          )}
        </div>
        <ChevronIcon open={expanded} />
      </button>

      {expanded && (
        <div className="mixer-panel">
          {/* Error state */}
          {soundLoadError && (
            <div className="mixer-error">
              <span>{soundLoadError}</span>
              <button onClick={() => setSoundLoadError(null)}>✕</button>
            </div>
          )}

          {/* Active sounds with individual volume */}
          {activeCount > 0 && (
            <div className="mixer-active">
              <div className="mixer-section-label">Active</div>
              {Object.entries(activeSounds).map(([key, vol]) => (
                <div key={key} className="mixer-sound-row">
                  <div className="mixer-sound-identity">
                    <SoundIcon color={SOUND_META[key]?.color || 'var(--color-accent)'} />
                    <span className="mixer-sound-name">{SOUND_META[key]?.label || key}</span>
                  </div>
                  <div className="mixer-sound-controls">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={vol}
                      onChange={(e) => onVolumeChange(key, parseFloat(e.target.value))}
                      className="mixer-vol-slider"
                      style={{ '--slider-color': SOUND_META[key]?.color || 'var(--color-accent)' }}
                      aria-label={`${SOUND_META[key]?.label} volume`}
                    />
                    <button
                      className="mixer-remove-btn"
                      onClick={() => onRemoveSound(key)}
                      aria-label={`Remove ${SOUND_META[key]?.label}`}
                    >
                      <RemoveIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Available sounds */}
          {availableSounds.length > 0 && (
            <div className="mixer-available">
              <div className="mixer-section-label">Add sound</div>
              <div className="mixer-available-grid">
                {availableSounds.map((key) => (
                  <button
                    key={key}
                    className="mixer-available-btn"
                    onClick={() => handleAddSound(key)}
                    style={{ '--sound-color': SOUND_META[key]?.color || 'var(--color-accent)' }}
                  >
                    <SoundIcon color={SOUND_META[key]?.color || 'var(--color-accent)'} />
                    <span>{SOUND_META[key]?.label || key}</span>
                    <AddIcon />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Master hint */}
          {activeCount === 0 && (
            <p className="mixer-empty-hint">
              Layer up to 4 ambient sounds. Rain + café is a classic.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function WaveformIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 8c1.5-3 3-4.5 4.5-4.5S10 5 11.5 8s3 4.5 4.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M2 5c1-2 2-3 3-3s2 1 3 3 2 3 3 3 2-1 3-3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <path d="M2 11c1-2 2-3 3-3s2 1 3 3 2 3 3 3 2-1 3-3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

function AddIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
