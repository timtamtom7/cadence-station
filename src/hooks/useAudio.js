import { useRef, useEffect, useCallback } from 'react';
import { Howl } from 'howler';

// Ambient sound configurations
// Tommaso: replace these URLs with self-hosted audio for production reliability.
const SOUND_URLS = {
  brownNoise: 'https://cdn.freesound.org/previews/469/469734_4921277-lq.mp3',
  whiteNoise:  'https://cdn.freesound.org/previews/346/346642_4939433-lq.mp3',
  cafe:        'https://cdn.freesound.org/previews/462/462750_3972125-lq.mp3',
  rain:        'https://cdn.freesound.org/previews/531/531947_2414082-lq.mp3',
  forest:      'https://cdn.freesound.org/previews/587/587558_5674468-lq.mp3',
  ocean:       'https://cdn.freesound.org/previews/320/320488_5121236-lq.mp3',
  lofi:        'https://cdn.freesound.org/previews/612/612093_7037-lq.mp3',
  fireplace:   'https://cdn.freesound.org/previews/532/532045_4392822-lq.mp3',
};

// Timer bell — a gentle chime when session ends
const TIMER_BELL_URL = 'https://cdn.freesound.org/previews/411/411089_5121236-lq.mp3';

// Sound labels for display
export const SOUND_META = {
  brownNoise:  { label: 'Brown Noise',  color: '#a78bfa' },
  whiteNoise:  { label: 'White Noise',  color: '#94a3b8' },
  cafe:        { label: 'Café',         color: '#fb923c' },
  rain:        { label: 'Rain',          color: '#60a5fa' },
  forest:      { label: 'Forest',       color: '#4ade80' },
  ocean:       { label: 'Ocean',        color: '#38bdf8' },
  lofi:        { label: 'Lo-fi',        color: '#f472b6' },
  fireplace:   { label: 'Fireplace',   color: '#fbbf24' },
};

export const ALL_SOUNDS = Object.keys(SOUND_URLS);

export function useAudio() {
  // Pool of active Howl instances: { [soundKey]: { howl: Howl, volume: number } }
  const poolRef = useRef({});
  const bellRef = useRef(null);

  const play = useCallback((soundKey, volume = 0.5) => {
    if (!soundKey || soundKey === 'none') return;
    const url = SOUND_URLS[soundKey];
    if (!url) return;

    // Stop existing instance of this sound
    if (poolRef.current[soundKey]?.howl) {
      poolRef.current[soundKey].howl.stop();
      poolRef.current[soundKey].howl.unload();
    }

    try {
      const howl = new Howl({
        src: [url],
        loop: true,
        volume,
        html5: true,
        preload: true,
      });
      howl.play();
      poolRef.current[soundKey] = { howl, volume };
    } catch (e) {
      console.warn(`Audio playback failed for "${soundKey}":`, e);
    }
  }, []);

  const stop = useCallback((soundKey) => {
    if (soundKey && poolRef.current[soundKey]) {
      const { howl } = poolRef.current[soundKey];
      howl.fade(howl.volume(), 0, 500);
      setTimeout(() => {
        howl.stop();
        howl.unload();
        delete poolRef.current[soundKey];
      }, 500);
    } else {
      // Stop all sounds
      Object.values(poolRef.current).forEach(({ howl }) => {
        howl.fade(howl.volume(), 0, 500);
        setTimeout(() => {
          howl.stop();
          howl.unload();
        }, 500);
      });
      poolRef.current = {};
    }
  }, []);

  const setVolume = useCallback((soundKey, vol) => {
    if (poolRef.current[soundKey]) {
      poolRef.current[soundKey].howl.volume(vol);
      poolRef.current[soundKey].volume = vol;
    }
  }, []);

  const fadeOut = useCallback((soundKey) => {
    if (soundKey && poolRef.current[soundKey]) {
      const { howl } = poolRef.current[soundKey];
      howl.fade(howl.volume(), 0, 800);
      setTimeout(() => {
        howl.stop();
        howl.unload();
        delete poolRef.current[soundKey];
      }, 800);
    } else {
      Object.values(poolRef.current).forEach(({ howl }) => {
        howl.fade(howl.volume(), 0, 800);
      });
      setTimeout(() => {
        Object.values(poolRef.current).forEach(({ howl }) => {
          howl.stop();
          howl.unload();
        });
        poolRef.current = {};
      }, 800);
    }
  }, []);

  // Play the timer bell sound
  const playBell = useCallback(() => {
    if (bellRef.current) {
      bellRef.current.stop();
      bellRef.current.unload();
    }
    try {
      const bell = new Howl({
        src: [TIMER_BELL_URL],
        volume: 0.6,
        html5: true,
        preload: true,
        onend: () => {
          bellRef.current = null;
        },
      });
      bell.play();
      bellRef.current = bell;
    } catch (e) {
      console.warn('Bell sound failed:', e);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(poolRef.current).forEach(({ howl }) => {
        howl.stop();
        howl.unload();
      });
      poolRef.current = {};
      if (bellRef.current) {
        bellRef.current.stop();
        bellRef.current.unload();
      }
    };
  }, []);

  return { play, stop, setVolume, fadeOut, playBell };
}
