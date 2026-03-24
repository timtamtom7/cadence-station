import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription, TIERS } from '../../context/SubscriptionContext';
import './Onboarding.css';

const STORAGE_KEY = 'cadence_onboarding_done';

export function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { completeOnboarding, setTier } = useSubscription();

  const TOTAL_STEPS = 4;

  const next = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      if (onComplete) onComplete();
    }
  };

  const skip = () => {
    completeOnboarding();
    if (onComplete) onComplete();
  };

  const selectSessionType = (type) => {
    // Just highlight selection, store in onboarding state
    document.querySelectorAll('.onboard-type-option').forEach(el => {
      el.classList.remove('selected');
    });
    document.querySelector(`[data-type="${type}"]`)?.classList.add('selected');
  };

  const selectDuration = (duration) => {
    document.querySelectorAll('.onboard-duration-option').forEach(el => {
      el.classList.remove('selected');
    });
    document.querySelector(`[data-duration="${duration}"]`)?.classList.add('selected');
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-backdrop" onClick={skip} />

      <div className="onboarding-card">
        {/* Progress */}
        <div className="onboard-progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
            />
          ))}
        </div>

        {/* Skip */}
        <button className="onboard-skip" onClick={skip}>
          Skip
        </button>

        {/* Screens */}
        <div className="onboard-screens">

          {/* ── Screen 1: Find your rhythm ── */}
          {step === 0 && (
            <div className="onboard-screen page-enter">
              <div className="onboard-visual">
                <div className="onboard-station-art">
                  <div className="station-ring station-ring-1" />
                  <div className="station-ring station-ring-2" />
                  <div className="station-ring station-ring-3" />
                  <div className="station-center">
                    <StationIcon />
                  </div>
                  <div className="station-waves">
                    <div className="wave w1" />
                    <div className="wave w2" />
                    <div className="wave w3" />
                  </div>
                </div>
              </div>

              <div className="onboard-content">
                <h2 className="onboard-title">Find your rhythm.</h2>
                <p className="onboard-body">
                  Cadence Station is a focus companion. Pick a duration, work in silence,
                  optionally with a partner somewhere else in the world — and end with
                  a quiet sense of shared accomplishment.
                </p>
                <p className="onboard-hint">
                  No accounts. No chat. No leaderboard.
                </p>
              </div>

              <div className="onboard-actions">
                <button className="btn-onboard-primary" onClick={next}>
                  Let's go
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── Screen 2: Pick your focus ── */}
          {step === 1 && (
            <div className="onboard-screen page-enter" key="step1">
              <div className="onboard-content">
                <h2 className="onboard-title">What kind of focus?</h2>
                <p className="onboard-body">
                  Each session type has a different energy. Choose what matches your work.
                </p>
              </div>

              <div className="onboard-types" onClick={(e) => {
                const card = e.target.closest('.onboard-type-option');
                if (card) {
                  document.querySelectorAll('.onboard-type-option').forEach(el => el.classList.remove('selected'));
                  card.classList.add('selected');
                }
              }}>
                <div className="onboard-type-option selected" data-type="deep">
                  <div className="type-art">
                    <DeepWorkIcon />
                  </div>
                  <div className="type-text">
                    <span className="type-label">Deep Work</span>
                    <span className="type-desc">Analytical, complex problems. 90-minute sessions.</span>
                  </div>
                </div>

                <div className="onboard-type-option" data-type="creative">
                  <div className="type-art">
                    <CreativeIcon />
                  </div>
                  <div className="type-text">
                    <span className="type-label">Creative Flow</span>
                    <span className="type-desc">Writing, design, brainstorming. Let ideas breathe.</span>
                  </div>
                </div>

                <div className="onboard-type-option" data-type="study">
                  <div className="type-art">
                    <StudyIcon />
                  </div>
                  <div className="type-text">
                    <span className="type-label">Study</span>
                    <span className="type-desc">Reading, memorizing, coursework. Steady 25 or 50-minute blocks.</span>
                  </div>
                </div>

                <div className="onboard-type-option" data-type="morning">
                  <div className="type-art">
                    <MorningIcon />
                  </div>
                  <div className="type-text">
                    <span className="type-label">Morning Sprint</span>
                    <span className="type-desc">Quick win before the day pulls you somewhere else.</span>
                  </div>
                </div>
              </div>

              <div className="onboard-actions">
                <button className="btn-onboard-ghost" onClick={next}>
                  Continue
                </button>
                <button className="btn-onboard-primary" onClick={next}>
                  Got it
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── Screen 3: Set your pace ── */}
          {step === 2 && (
            <div className="onboard-screen page-enter" key="step2">
              <div className="onboard-content">
                <h2 className="onboard-title">Set your pace.</h2>
                <p className="onboard-body">
                  Your default session length. You can always change this later.
                </p>
              </div>

              <div className="onboard-durations">
                <div
                  className="onboard-duration-option selected"
                  data-duration="25"
                  onClick={() => selectDuration(25)}
                >
                  <span className="dur-minutes">25</span>
                  <span className="dur-label">min</span>
                  <span className="dur-desc">Pomodoro sprint</span>
                </div>
                <div
                  className="onboard-duration-option"
                  data-duration="50"
                  onClick={() => selectDuration(50)}
                >
                  <span className="dur-minutes">50</span>
                  <span className="dur-label">min</span>
                  <span className="dur-desc">Standard focus</span>
                </div>
                <div
                  className="onboard-duration-option"
                  data-duration="90"
                  onClick={() => selectDuration(90)}
                >
                  <span className="dur-minutes">90</span>
                  <span className="dur-label">min</span>
                  <span className="dur-desc">Deep work block</span>
                </div>
              </div>

              <div className="onboard-actions">
                <button className="btn-onboard-ghost" onClick={next}>
                  Continue
                </button>
                <button className="btn-onboard-primary" onClick={next}>
                  Set default
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── Screen 4: Let's focus ── */}
          {step === 3 && (
            <div className="onboard-screen page-enter" key="step3">
              <div className="onboard-visual">
                <div className="onboard-focus-art">
                  <div className="focus-ring">
                    <div className="focus-inner" />
                  </div>
                  <div className="focus-pulse" />
                </div>
              </div>

              <div className="onboard-content">
                <h2 className="onboard-title">Let's focus.</h2>
                <p className="onboard-body">
                  That's it. Pick a duration, start a session, and see what happens
                  when you carve out a quiet moment for your work.
                </p>
                <p className="onboard-hint">
                  Your streak starts the moment you complete your first session.
                </p>
              </div>

              <div className="onboard-actions">
                <button className="btn-onboard-primary" onClick={() => {
                  completeOnboarding();
                  if (onComplete) onComplete();
                  else navigate('/app');
                }}>
                  Start first session
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────

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

function DeepWorkIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="8" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 12h8M10 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="20" cy="19" r="1.5" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}

function CreativeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 4l2.5 5 5.5.8-4 3.9.9 5.5L14 16.5l-4.9 2.7.9-5.5-4-3.9L11.5 9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function StudyIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M5 10l9-6 9 6v12H5V10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 22v-8h6v8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function MorningIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14 4v3M14 21v3M4 14h3M21 14h3M6.6 6.6l2.1 2.1M19.3 19.3l2.1 2.1M6.6 21.4l2.1-2.1M19.3 8.7l2.1-2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
