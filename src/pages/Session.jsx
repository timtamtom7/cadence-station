import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ProgressRing } from '../components/session/ProgressRing';
import { AmbientSounds } from '../components/session/AmbientSounds';
import { PartnerIndicator } from '../components/session/PartnerIndicator';
import { SessionComplete } from '../components/session/SessionComplete';
import { Button } from '../components/shared/Button';
import { useSession } from '../context/SessionContext';
import { useAudio } from '../hooks/useAudio';
import {
  joinWaitingQueue,
  leaveWaitingQueue,
  subscribeToPair,
  subscribeToQueueCount,
  markCompleted,
  markEndedEarly,
  cleanupPair,
  saveSession,
  updateStreak,
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
  const { activeSession, startSession, endSession, setActiveSession, ambientSound, setAmbientSound, ambientVolume, setAmbientVolume } = useSession();
  const { play, stop, setVolume, fadeOut } = useAudio();

  // Session config from URL
  const duration = parseInt(searchParams.get('duration') || '25');
  const sessionType = searchParams.get('type') || 'solo';
  const sessionGoal = searchParams.get('goal') || null;

  // Session state
  const [phase, setPhase] = useState('loading'); // loading | waiting | matched | active | complete
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);
  const [queueCount, setQueueCount] = useState(0);

  // Paired session state
  const [pairId, setPairId] = useState(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEndedEarly, setPartnerEndedEarly] = useState(false);
  const [bothCompleted, setBothCompleted] = useState(false);

  // Refs
  const intervalRef = useRef(null);
  const unsubscribePairRef = useRef(null);
  const unsubscribeQueueRef = useRef(null);
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  // ── Start the session ──────────────────────────────────────────

  const beginSession = useCallback(async (opts = {}) => {
    const session = startSession({
      duration,
      type: sessionType,
      goal: sessionGoal,
      ...opts,
    });

    setPhase('active');
    setTimeLeft(duration * 60);
    setIsPaused(false);

    // Start ambient sound if selected
    if (ambientSound !== 'none') {
      play(ambientSound, ambientVolume);
    }
  }, [duration, sessionType, sessionGoal, startSession, ambientSound, ambientVolume, play]);

  // ── Solo: start immediately ────────────────────────────────────

  useEffect(() => {
    if (phase !== 'loading') return;

    if (sessionType === 'solo') {
      beginSession();
      return;
    }

    // Paired: join waiting queue
    const initPaired = async () => {
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
          handleComplete();
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
      const partnerCompletedVal = isA ? pair.completedB : pair.completedA;
      const iCompletedVal = isA ? pair.completedA : pair.completedB;

      if (partnerEndedEarlyVal) setPartnerEndedEarly(true);
      if (partnerCompletedVal && iCompletedVal) setBothCompleted(true);
    });

    return () => {
      if (unsubscribePairRef.current) unsubscribePairRef.current();
    };
  }, [pairId, phase]);

  // ── Audio volume sync ─────────────────────────────────────────

  useEffect(() => {
    setVolume(ambientVolume);
  }, [ambientVolume, setVolume]);

  // ── Ambient sound change ──────────────────────────────────────

  useEffect(() => {
    if (phase !== 'active') return;
    if (ambientSound === 'none') {
      fadeOut();
    } else {
      play(ambientSound, ambientVolume);
    }
  }, [ambientSound]);

  // ── Completion ─────────────────────────────────────────────────

  const handleComplete = async () => {
    fadeOut();
    stop();

    if (pairId) {
      await markCompleted(pairId, sessionIdRef.current);
    }

    const session = endSession(true);
    updateStreak();
    saveSession(session);
    setCompletedSession(session);
    setPhase('complete');
  };

  // ── End early ─────────────────────────────────────────────────

  const handleEndEarly = async () => {
    setShowEndConfirm(false);
    fadeOut();
    stop();

    if (pairId) {
      await markEndedEarly(pairId, sessionIdRef.current);
    }

    const session = endSession(false);
    updateStreak();
    saveSession(session);
    setCompletedSession(session);
    setPhase('complete');
  };

  // ── Cleanup on unmount ─────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (unsubscribePairRef.current) unsubscribePairRef.current();
      if (unsubscribeQueueRef.current) unsubscribeQueueRef.current();
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
              <div className="waiting-orbit" />
              <div className="waiting-center">
                <StationIcon />
              </div>
            </div>
            <h2 className="waiting-title">Waiting for a partner</h2>
            <p className="waiting-subtitle">
              {queueCount === 0
                ? 'Be the first in the queue for this duration.'
                : `${queueCount} ${queueCount === 1 ? 'person is' : 'people are'} also waiting for a ${duration}-minute session.`}
            </p>
            <p className="waiting-hint">You'll be matched automatically.</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await leaveWaitingQueue(sessionIdRef.current, duration);
                navigate('/app');
              }}
            >
              Cancel
            </Button>
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
              <ProgressRing progress={progress} size={300} strokeWidth={5}>
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
              <AmbientSounds
                selected={ambientSound}
                volume={ambientVolume}
                onSoundChange={setAmbientSound}
                onVolumeChange={setAmbientVolume}
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
