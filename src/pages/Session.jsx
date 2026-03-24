import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ProgressRing } from '../components/session/ProgressRing';
import { SoundMixer } from '../components/session/SoundMixer';
import { PartnerRadar } from '../components/session/PartnerRadar';
import { PartnerIndicator } from '../components/session/PartnerIndicator';
import { SessionComplete } from '../components/session/SessionComplete';
import { Button } from '../components/shared/Button';
import { useSession } from '../context/SessionContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useAudio } from '../hooks/useAudio';
import { checkAndAwardAchievements } from '../components/achievements/Achievements';
import {
  joinWaitingQueue,
  leaveWaitingQueue,
  subscribeToPair,
  subscribeToQueueCount,
  subscribeToConnectionStatus,
  markCompleted,
  markEndedEarly,
  saveSession,
  updateStreak,
  isFirebaseConfigured,
} from '../firebase/database';
import './Session.css';

// Partner name generator for anonymous pairing
const PARTNER_NAMES = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Drew', 'Blake', 'Cameron', 'Dakota', 'Emery', 'Finley', 'Harper', 'Hayden', 'Jamie', 'Kendall', 'Logan', 'Parker', 'Peyton', 'Reese', 'Rowan', 'Sage', 'Skylar', 'Spencer', 'Sydney'];

function getRandomPartnerName() {
  return PARTNER_NAMES[Math.floor(Math.random() * PARTNER_NAMES.length)];
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Session() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startSession, endSession } = useSession();
  const { recordSession } = useSubscription();
  const { play, stop, setVolume, fadeOut, playBell } = useAudio();

  // Sound mixer state — multiple active sounds with individual volumes
  const [activeSounds, setActiveSounds] = useState({});

  // Session config from URL
  const duration = parseInt(searchParams.get('duration') || '25');
  const sessionType = searchParams.get('type') || 'solo';
  const sessionGoal = searchParams.get('goal') || null;

  // Session state
  const [phase, setPhase] = useState('loading'); // loading | waiting | matched | active | complete | no_firebase | no_network | pairing_error | connection_lost
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);
  const [queueCount, setQueueCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pairingError, setPairingError] = useState(null);

  // Paired session state
  const [pairId, setPairId] = useState(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEndedEarly, setPartnerEndedEarly] = useState(false);

  // Refs
  const intervalRef = useRef(null);
  const unsubscribePairRef = useRef(null);
  const unsubscribeQueueRef = useRef(null);
  const unsubscribeConnRef = useRef(null);
  const sessionIdRef = useRef(null);
  const handleCompleteRef = useRef(null);

  // Generate session ID lazily via useState initializer
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  // Sync to ref for use in callbacks that expect a ref
  sessionIdRef.current = sessionId;

  // ── Network status monitoring ───────────────────────────────
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      // If we're in an active session, note it but don't interrupt
      if (phase === 'waiting' || phase === 'matched') {
        setPairingError('Network connection lost. Check your internet and try again.');
      }
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [phase]);

  // ── Start the session ──────────────────────────────────────────

  const beginSession = useCallback(async (opts = {}) => {
    startSession({
      duration,
      type: sessionType,
      goal: sessionGoal,
      ...opts,
    });

    setPhase('active');
    setTimeLeft(duration * 60);
    setIsPaused(false);

    // Record session for Free tier limit tracking
    recordSession();

    // Start all active sounds from the mixer
    Object.entries(activeSounds).forEach(([key, vol]) => {
      play(key, vol);
    });
  }, [duration, sessionType, sessionGoal, startSession, recordSession, activeSounds, play]);

  // ── Solo: start immediately ────────────────────────────────────

  useEffect(() => {
    if (phase !== 'loading') return;

    if (sessionType === 'solo') {
      beginSession();
      return;
    }

    // Paired: join waiting queue
    const initPaired = async () => {
      if (!navigator.onLine) {
        setPhase('no_network');
        return;
      }

      if (!isFirebaseConfigured()) {
        setPhase('no_firebase');
        return;
      }

      try {
        const id = sessionIdRef.current;
        const result = await joinWaitingQueue(id, duration);

        if (result.matched) {
          setPairId(result.pairId);
          setPartnerName(getRandomPartnerName());
          setPhase('matched');

          // Brief match screen (1.5s), then begin
          setTimeout(() => {
            beginSession({ pairId: result.pairId, partnerId: result.partnerId });
          }, 1500);
        } else {
          setPhase('waiting');
          // Subscribe to queue count
          unsubscribeQueueRef.current = subscribeToQueueCount(duration, setQueueCount);
        }
      } catch (err) {
        console.warn('Pairing error:', err);
        setPairingError('Connection error. Could not reach Firebase.');
        setPhase('pairing_error');
      }
    };

    initPaired();

    return () => {
      if (unsubscribeQueueRef.current) unsubscribeQueueRef.current();
    };
  }, [phase, sessionType, duration, beginSession]);

  // ── Timer countdown ────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'active' || isPaused) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (handleCompleteRef.current) handleCompleteRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [phase, isPaused]);

  // ── Partner subscription (paired session) ────────────────────

  useEffect(() => {
    if (!pairId || phase !== 'active') return;

    unsubscribePairRef.current = subscribeToPair(pairId, (pair) => {
      if (!pair) return;
      const mySessionId = sessionIdRef.current;
      const isA = pair.sessionAId === mySessionId;
      const partnerEndedEarlyVal = isA ? pair.endedEarlyB : pair.endedEarlyA;

      if (partnerEndedEarlyVal) setPartnerEndedEarly(true);
    });

    return () => {
      if (unsubscribePairRef.current) unsubscribePairRef.current();
    };
  }, [pairId, phase]);

  // ── Firebase connection monitoring ──────────────────────────

  useEffect(() => {
    if (phase !== 'active') return;

    unsubscribeConnRef.current = subscribeToConnectionStatus((connected) => {
      if (!connected) {
        setPhase('connection_lost');
      }
    });

    return () => {
      if (unsubscribeConnRef.current) unsubscribeConnRef.current();
    };
  }, [phase]);

  // ── Sound mixer handlers ─────────────────────────────────────

  const handleAddSound = useCallback((key, vol) => {
    setActiveSounds((prev) => {
      if (Object.keys(prev).length >= 4) return prev;
      const next = { ...prev, [key]: vol };
      if (phase === 'active') play(key, vol);
      return next;
    });
  }, [phase, play]);

  const handleRemoveSound = useCallback((key) => {
    setActiveSounds((prev) => {
      const next = { ...prev };
      delete next[key];
      stop(key);
      return next;
    });
  }, [stop]);

  const handleVolumeChange = useCallback((key, vol) => {
    setActiveSounds((prev) => ({ ...prev, [key]: vol }));
    setVolume(key, vol);
  }, [setVolume]);

  // ── Completion ─────────────────────────────────────────────────

  const handleComplete = useCallback(async () => {
    // Play the bell before fading out
    playBell();
    fadeOut();
    stop();

    if (pairId) {
      await markCompleted(pairId, sessionIdRef.current);
    }

    const session = endSession(true);
    updateStreak();
    saveSession(session);
    const newAchievements = checkAndAwardAchievements(session);
    setCompletedSession({ ...session, newAchievements });
    setPhase('complete');
  }, [pairId, fadeOut, stop, playBell, endSession]);

  // Keep ref in sync
  handleCompleteRef.current = handleComplete;

  // ── End early ─────────────────────────────────────────────────

  const handleEndEarly = useCallback(async () => {
    setShowEndConfirm(false);
    fadeOut();
    stop();

    if (pairId) {
      await markEndedEarly(pairId, sessionIdRef.current);
    }

    const session = endSession(false);
    updateStreak();
    saveSession(session);
    const newAchievements = checkAndAwardAchievements(session);
    setCompletedSession({ ...session, newAchievements });
    setPhase('complete');
  }, [pairId, fadeOut, stop, endSession]);

  // ── Cleanup on unmount ─────────────────────────────────────────

  // ── Cleanup on unmount ─────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (unsubscribePairRef.current) unsubscribePairRef.current();
      if (unsubscribeQueueRef.current) unsubscribeQueueRef.current();
      if (unsubscribeConnRef.current) unsubscribeConnRef.current();
      stop();
    };
  }, [stop]);

  // ── Pause/resume ──────────────────────────────────────────────

  const togglePause = () => {
    setIsPaused((p) => !p);
  };

  // ── Progress ─────────────────────────────────────────────────

  const totalSeconds = duration * 60;
  const elapsed = totalSeconds - timeLeft;
  const progress = elapsed / totalSeconds;

  // ── Complete screen ───────────────────────────────────────────

  if (phase === 'complete' && completedSession) {
    return (
      <div className="session-page">
        <SessionComplete
          session={completedSession}
          onSave={(s) => {
            saveSession(s);
          }}
          onDismiss={() => navigate('/app')}
        />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="session-page">
      {/* Background ambient */}
      <div className="session-bg">
        <div className="ambient-wave" />
      </div>

      {/* Header */}
      <header className="session-header">
        <Link to="/app" className="session-back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Exit
        </Link>

        {phase === 'active' && (
          <span className="session-type-badge">
            {sessionType === 'paired' ? 'Paired' : 'Solo'}
          </span>
        )}
      </header>

      {/* Main content */}
      <main className="session-main">
        {/* Phase: loading */}
        {phase === 'loading' && (
          <div className="session-loading">
            <div className="loading-ring" />
            <p>Preparing your session...</p>
          </div>
        )}

        {/* Phase: waiting for partner */}
        {phase === 'waiting' && (
          <div className="session-waiting page-enter">
            <div className="waiting-animation">
              <PartnerRadar partnerCount={queueCount} />
            </div>
            <h2 className="waiting-title">Scanning for a partner</h2>
            <p className="waiting-subtitle">
              {queueCount === 0
                ? 'No one else is waiting — you can be first, or start a solo session.'
                : `${queueCount} ${queueCount === 1 ? 'person is' : 'people are'} also looking for a ${duration}-min focus partner.`}
            </p>
            <p className="waiting-hint">You'll be matched automatically when someone joins.</p>
            <div className="waiting-actions">
              <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
                Back
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await leaveWaitingQueue(sessionIdRef.current, duration);
                  navigate('/app');
                }}
              >
                Cancel search
              </Button>
            </div>
          </div>
        )}

        {/* Phase: Firebase not configured */}
        {phase === 'no_firebase' && (
          <div className="session-waiting page-enter">
            <div className="waiting-animation">
              <div className="waiting-center">
                <FirebaseIcon />
              </div>
            </div>
            <h2 className="waiting-title">Firebase not configured</h2>
            <p className="waiting-subtitle">
              Paired sessions need Firebase Realtime Database to match you with a partner.
              It takes about 5 minutes to set up.
            </p>
            <div className="firebase-setup-guide">
              <p className="guide-step"><span className="step-num">1</span> Create a project at <strong>console.firebase.google.com</strong></p>
              <p className="guide-step"><span className="step-num">2</span> Enable <strong>Realtime Database</strong> in your project</p>
              <p className="guide-step"><span className="step-num">3</span> Copy your config into <code>src/firebase/config.js</code></p>
              <p className="guide-step"><span className="step-num">4</span> Set database rules to read/write allowed</p>
            </div>
            <p className="waiting-hint">
              Until then, use <strong>Solo sessions</strong> — they work without Firebase.
            </p>
            <div className="waiting-actions">
              <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
                Back to app
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  // Switch to solo mode and restart
                  navigate(`/app/session/new?duration=${duration}&type=solo`);
                }}
              >
                Start solo session instead
              </Button>
            </div>
          </div>
        )}

        {/* Phase: Network offline */}
        {phase === 'no_network' && (
          <div className="session-waiting page-enter">
            <div className="waiting-animation">
              <div className="waiting-center">
                <NetworkIcon />
              </div>
            </div>
            <h2 className="waiting-title">No network connection</h2>
            <p className="waiting-subtitle">
              Paired sessions need an internet connection to match you with a partner.
            </p>
            <p className="waiting-hint">
              Solo sessions work offline. Or reconnect and try again.
            </p>
            <div className="waiting-actions">
              <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
                Back to app
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/app/session/new?duration=${duration}&type=solo`)}
              >
                Start solo session
              </Button>
            </div>
          </div>
        )}

        {/* Phase: Connection lost during active session */}
        {phase === 'connection_lost' && (
          <div className="session-waiting page-enter">
            <div className="waiting-animation">
              <div className="waiting-center">
                <NetworkIcon />
              </div>
            </div>
            <h2 className="waiting-title">Connection lost</h2>
            <p className="waiting-subtitle">
              You lost connection to Firebase. Your session is still running — the timer won't stop.
            </p>
            <p className="waiting-hint">
              When connection restores, your progress will sync automatically.
            </p>
            <div className="waiting-actions">
              <Button variant="ghost" size="sm" onClick={() => setShowEndConfirm(true)}>
                End session
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setPhase('active')}
              >
                Keep going
              </Button>
            </div>
          </div>
        )}

        {/* Phase: Pairing error */}
        {phase === 'pairing_error' && (
          <div className="session-waiting page-enter">
            <div className="waiting-animation">
              <div className="waiting-center">
                <ErrorIcon />
              </div>
            </div>
            <h2 className="waiting-title">Couldn't find a partner</h2>
            <p className="waiting-subtitle">
              {pairingError || 'Something went wrong while matching. This can happen if the connection dropped or Firebase is unavailable.'}
            </p>
            <p className="waiting-hint">
              Try again in a moment, or start a solo session instead.
            </p>
            <div className="waiting-actions">
              <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
                Back to app
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  setPairingError(null);
                  setPhase('loading');
                  // Retry pairing
                  if (sessionType === 'paired') {
                    const id = sessionIdRef.current;
                    const result = await joinWaitingQueue(id, duration).catch(() => ({ matched: false, pairId: null }));
                    if (result.matched) {
                      setPairId(result.pairId);
                      setPartnerName(getRandomPartnerName());
                      setPhase('matched');
                      setTimeout(() => beginSession({ pairId: result.pairId, partnerId: result.partnerId }), 1500);
                    } else {
                      setPhase('waiting');
                    }
                  }
                }}
              >
                Try again
              </Button>
            </div>
          </div>
        )}

        {/* Phase: matched */}
        {phase === 'matched' && (
          <div className="session-matched page-enter">
            <div className="matched-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="16" stroke="var(--color-partner)" strokeWidth="2"/>
                <path d="M13 20l5 5 9-9" stroke="var(--color-partner)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="matched-title">Matched.</h2>
            <p className="matched-subtitle">
              {sessionGoal
                ? `${partnerName} is working on: "${sessionGoal}"`
                : `You're paired with ${partnerName}.`}
            </p>
            <p className="matched-hint">Starting in a moment...</p>
          </div>
        )}

        {/* Phase: active */}
        {phase === 'active' && (
          <div className="session-active">
            {/* Timer */}
            <div className="timer-section">
              <ProgressRing progress={progress} size={340} strokeWidth={6}>
                <span className="timer-display">{formatTime(timeLeft)}</span>
                <span className="timer-label">
                  {isPaused ? 'Paused' : 'remaining'}
                </span>
              </ProgressRing>
            </div>

            {/* Partner indicator */}
            {sessionType === 'paired' && (
              <div className="partner-section">
                <PartnerIndicator
                  partnerName={partnerName}
                  status="connected"
                  partnerEndedEarly={partnerEndedEarly}
                />
              </div>
            )}

            {/* Controls */}
            <div className="session-controls">
              <SoundMixer
                activeSounds={activeSounds}
                onAddSound={handleAddSound}
                onRemoveSound={handleRemoveSound}
                onVolumeChange={handleVolumeChange}
              />

              <div className="control-buttons">
                <button
                  className="pause-btn"
                  onClick={togglePause}
                  aria-label={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? <PlayIcon /> : <PauseIcon />}
                </button>

                <button
                  className="end-btn"
                  onClick={() => setShowEndConfirm(true)}
                >
                  End early
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* End early confirmation modal */}
      {showEndConfirm && (
        <div className="modal-overlay" onClick={() => setShowEndConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">End session early?</h3>
            <p className="modal-body">
              You've been focusing for {Math.round(elapsed / 60)} minutes of your {duration}-minute session.
              Ending early won't count as a completed session.
            </p>
            {sessionType === 'paired' && (
              <p className="modal-warning">
                Your partner will be notified that you ended early.
              </p>
            )}
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setShowEndConfirm(false)}>
                Keep going
              </Button>
              <Button variant="danger" onClick={handleEndEarly}>
                End session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StationIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10" stroke="var(--color-accent)" strokeWidth="2"/>
      <circle cx="14" cy="14" r="5" fill="var(--color-accent)" opacity="0.3"/>
      <circle cx="14" cy="14" r="2.5" fill="var(--color-accent)"/>
      <path d="M14 4v3M14 21v3M4 14h3M21 14h3" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function FirebaseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10" stroke="var(--color-error)" strokeWidth="2"/>
      <path d="M10 12l4 8M18 12l-4 8" stroke="var(--color-error)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10" stroke="var(--color-warning)" strokeWidth="2"/>
      <path d="M14 8v6M14 18v2" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10" stroke="var(--color-error)" strokeWidth="2"/>
      <path d="M10 10l8 8M18 10l-8 8" stroke="var(--color-error)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="5" y="4" width="3" height="12" rx="1" fill="currentColor"/>
      <rect x="12" y="4" width="3" height="12" rx="1" fill="currentColor"/>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 4l10 6-10 6V4z" fill="currentColor"/>
    </svg>
  );
}
