import { useRef, useEffect, useCallback } from 'react';
import { Howl } from 'howler';

// Ambient sound configurations — using free, royalty-free sources
// TODO: Tommaso should replace these URLs with self-hosted audio files
// for production reliability. These are public stream URLs.
const SOUND_URLS = {
  none: null,
  brownNoise: 'https://cdn.freesound.org/previews/469/469734_4921277-lq.mp3',
  whiteNoise: 'https://cdn.freesound.org/previews/346/346642_4939433-lq.mp3',
  cafe: 'https://cdn.freesound.org/previews/462/462750_3972125-lq.mp3',
  forest: 'https://cdn.freesound.org/previews/587/587558_5674468-lq.mp3',
  rain: 'https://cdn.freesound.org/previews/531/531947_2414082-lq.mp3',
  ocean: 'https://cdn.freesound.org/previews/587/587558_5674468-lq.mp3', // placeholder
};

export function useAudio() {
  const howlRef = useRef(null);
  const isPlayingRef = useRef(false);

  const play = useCallback((soundKey, volume = 0.5) => {
    // Stop current
    if (howlRef.current) {
      howlRef.current.stop();
      howlRef.current.unload();
      howlRef.current = null;
    }
    isPlayingRef.current = false;

    if (soundKey === 'none' || !SOUND_URLS[soundKey]) return;

    const url = SOUND_URLS[soundKey];
    if (!url) return;

    try {
      const howl = new Howl({
        src: [url],
        loop: true,
        volume,
        html5: true, // allows streaming for long audio
        preload: true,
      });
      howl.play();
      howlRef.current = howl;
      isPlayingRef.current = true;
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, []);

  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.fade(howlRef.current.volume(), 0, 500);
      setTimeout(() => {
        if (howlRef.current) {
          howlRef.current.stop();
          howlRef.current.unload();
          howlRef.current = null;
        }
        isPlayingRef.current = false;
      }, 500);
    }
  }, []);

  const setVolume = useCallback((vol) => {
    if (howlRef.current) {
      howlRef.current.volume(vol);
    }
  }, []);

  const fadeOut = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.fade(howlRef.current.volume(), 0, 800);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
      }
    };
  }, []);

  return { play, stop, setVolume, fadeOut, isPlaying: isPlayingRef };
}
