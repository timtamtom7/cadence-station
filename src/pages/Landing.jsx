import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from '../components/shared/Button';
import { DurationPicker } from '../components/shared/DurationPicker';
import { SessionTypePicker } from '../components/shared/SessionTypePicker';
import { Onboarding } from '../components/onboarding/Onboarding';
import { useSubscription } from '../context/SubscriptionContext';
import './Landing.css';

const DEFAULT_DURATION_KEY = 'cadence_default_duration';

export function Landing() {
  const navigate = useNavigate();
  const { isOnboardingDone, completeOnboarding } = useSubscription();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [duration, setDuration] = useState(() => {
    return parseInt(localStorage.getItem(DEFAULT_DURATION_KEY) || '25');
  });
  const [sessionType, setSessionType] = useState('solo');

  useEffect(() => {
    if (!isOnboardingDone()) {
      // Small delay so the landing page renders first
      const t = setTimeout(() => setShowOnboarding(true), 800);
      return () => clearTimeout(t);
    }
  }, [isOnboardingDone]);

  const handleStart = () => {
    navigate(`/app/session/new?duration=${duration}&type=${sessionType}`);
  };

  return (
    <div className="landing page">
      {/* Animated Background */}
      <div className="landing-bg">
        <div className="bg-gradient-orb orb-1" />
        <div className="bg-gradient-orb orb-2" />
        <div className="bg-grain" />
      </div>

      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo">
          <LogoIcon />
          <span>Cadence Station</span>
        </div>
        <div className="header-actions">
          <Link to="/pricing" className="header-link">Pricing</Link>
          <Button variant="ghost" size="sm" to="/app">Open App</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        {/* Animated waveform */}
        <div className="hero-waveform" aria-hidden="true">
          <svg viewBox="0 0 800 120" preserveAspectRatio="none" className="waveform-svg">
            <path className="waveform-path waveform-path-1" d="M0,60 Q50,20 100,60 T200,60 T300,60 T400,60 T500,60 T600,60 T700,60 T800,60" />
            <path className="waveform-path waveform-path-2" d="M0,60 Q50,40 100,60 T200,60 T300,60 T400,60 T500,60 T600,60 T700,60 T800,60" />
            <path className="waveform-path waveform-path-3" d="M0,60 Q50,80 100,60 T200,60 T300,60 T400,60 T500,60 T600,60 T700,60 T800,60" />
          </svg>
        </div>

        {/* Geometric shapes */}
        <div className="hero-geometry" aria-hidden="true">
          <div className="geo-shape geo-1" />
          <div className="geo-shape geo-2" />
          <div className="geo-shape geo-3" />
          <div className="geo-shape geo-4" />
        </div>

        <div className="hero-eyebrow">
          <span className="hero-dot" />
          <span>Focus, together</span>
        </div>

        <h1 className="hero-title">Find your rhythm.<br />Together.</h1>
        <p className="hero-subtitle">
          Cadence Station pairs you with accountability partners for timed deep work sessions.
          You focus. They focus. No chat, no video — just the quiet signal that someone
          somewhere is in the zone too.
        </p>

        {/* Start CTA */}
        <div className="hero-cta card">
          <div className="cta-section">
            <span className="cta-label">Duration</span>
            <DurationPicker value={duration} onChange={setDuration} />
          </div>

          <div className="cta-section">
            <span className="cta-label">Session type</span>
            <SessionTypePicker value={sessionType} onChange={setSessionType} />
          </div>

          <Button variant="primary" size="lg" fullWidth onClick={handleStart}>
            Start Session
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </div>

        <p className="hero-note">No account required. Start focusing in seconds.</p>
      </section>

      {/* How it works */}
      <section className="landing-how">
        <h2 className="how-title">How it works</h2>
        <div className="how-steps">
          <HowStep
            number="01"
            title="Choose your duration"
            description="Pick 25 minutes for a quick sprint, 50 for standard work, or 90 for deep focus. Or set your own."
            icon={<ClockIcon />}
          />
          <HowStep
            number="02"
            title="Start solo or find a partner"
            description="Go alone and disappear into your work. Or join the queue and get matched with someone else working in silence — no chat, no pressure."
            icon={<MatchIcon />}
          />
          <HowStep
            number="03"
            title="Focus until the bell"
            description="A calm countdown keeps you honest. Ambient sounds help you slip into flow. When it's done, you get a quiet moment of reflection."
            icon={<FocusIcon />}
          />
        </div>
      </section>

      {/* Ambient sounds showcase */}
      <section className="landing-sounds">
        <div className="sounds-inner">
          <div className="sounds-header">
            <h2 className="sounds-title">Ambient soundscapes</h2>
            <p className="sounds-subtitle">The right background noise can change everything. Pick what helps you slip into flow.</p>
          </div>
          <div className="sounds-grid">
            <SoundCard name="Brown Noise" desc="Deep, rumbling — cancels out distracting sounds. Great for office or cafe environments." color="#8B5CF6" type="noise" />
            <SoundCard name="White Noise" desc="Flat, even spectrum. A clean slate for concentration." color="#6366F1" type="noise" />
            <SoundCard name="Rain" desc="Gentle rainfall on a window. Familiar, calming, focused." color="#0EA5E9" type="water" />
            <SoundCard name="Forest" desc="Birds, rustling leaves, distant wind. Like working in a clearing." color="#22C55E" type="nature" />
            <SoundCard name="Café" desc="Soft murmur of a coffee shop. The world's most popular focus environment." color="#F59E0B" type="social" />
            <SoundCard name="Ocean" desc="Slow waves, endless horizon. Best for creative or open-ended work." color="#06B6D4" type="water" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="features-grid">
          <FeatureCard
            icon={<TimerIcon />}
            title="Timed sessions"
            description="Pick 25, 50, or 90 minutes. Work in focused sprints with a visible countdown that keeps you honest."
          />
          <FeatureCard
            icon={<PairIcon />}
            title="Silent pairing"
            description="Get matched with someone working on the same duration. No chat, no pressure — just shared presence."
          />
          <FeatureCard
            icon={<SoundIcon />}
            title="Ambient sounds"
            description="Brown noise, café murmur, rain, forest. The right background helps you slip into flow faster."
          />
          <FeatureCard
            icon={<StreakIcon />}
            title="Streak tracking"
            description="Build momentum with daily streaks. A quiet nudge that adds up over weeks."
          />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-inner">
          <h2 className="cta-banner-title">Ready to find your rhythm?</h2>
          <p className="cta-banner-sub">No account. No commitment. Just start focusing.</p>
          <Button variant="primary" size="lg" onClick={handleStart}>
            Start your first session
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <LogoIcon />
            <span>Cadence Station</span>
          </div>
          <p className="footer-tagline">Find your rhythm. Together.</p>
          <div className="footer-links">
            <Link to="/pricing">Pricing</Link>
            <Link to="/app">App</Link>
            <Link to="/app/history">History</Link>
            <Link to="/app/settings">Settings</Link>
          </div>
        </div>
      </footer>

      {/* Onboarding overlay */}
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function HowStep({ number, title, description, icon }) {
  return (
    <div className="how-step">
      <div className="how-step-icon">{icon}</div>
      <div className="how-step-number">{number}</div>
      <h3 className="how-step-title">{title}</h3>
      <p className="how-step-desc">{description}</p>
    </div>
  );
}

function SoundCard({ name, desc, color, type }) {
  return (
    <div className="sound-card" style={{ '--sound-color': color }}>
      <div className="sound-visual">
        {type === 'noise' && <NoiseVisual color={color} />}
        {type === 'water' && <WaterVisual color={color} />}
        {type === 'nature' && <NatureVisual color={color} />}
        {type === 'social' && <CafeVisual color={color} />}
      </div>
      <span className="sound-name">{name}</span>
      <span className="sound-desc">{desc}</span>
    </div>
  );
}

function NoiseVisual({ color }) {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
      <path d="M0 16 Q6 8 12 16 T24 16 T36 16 T48 16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      <path d="M0 16 Q6 20 12 16 T24 16 T36 16 T48 16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <path d="M0 16 Q6 12 12 16 T24 16 T36 16 T48 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
}

function WaterVisual({ color }) {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
      <path d="M0 24 Q8 16 16 20 Q24 24 32 20 Q40 16 48 20" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      <path d="M0 20 Q8 14 16 18 Q24 22 32 18 Q40 14 48 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M0 28 Q8 22 16 26 Q24 30 32 26 Q40 22 48 26" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

function NatureVisual({ color }) {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
      <path d="M24 4 L30 14 H18 Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.2"/>
      <path d="M24 10 L32 22 H16 Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.15"/>
      <path d="M24 16 L30 26 H18 Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.1"/>
      <line x1="24" y1="26" x2="24" y2="32" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

function CafeVisual({ color }) {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
      <rect x="8" y="12" width="24" height="16" rx="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1"/>
      <path d="M32 15h2a4 4 0 010 8h-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M16 6c0 2 1.5 4 4 4s4-2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M22 4c0 1 0.8 2 2 2s2-1 2-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3"/>
    </svg>
  );
}

// ── Icons ────────────────────────────────────────────────────────

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10" stroke="var(--color-accent)" strokeWidth="2"/>
      <circle cx="14" cy="14" r="5" fill="var(--color-accent)" opacity="0.3"/>
      <circle cx="14" cy="14" r="2.5" fill="var(--color-accent)"/>
      <path d="M14 4v3M14 21v3M4 14h3M21 14h3" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 9v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 3h6M12 3v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function PairIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 20c0-3.314 2.686-6 6-6h8c3.314 0 6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 10l4-3v10l-4-3M11 7l4-2v12l-4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 8a4 4 0 010 6M19 6a7 7 0 010 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function StreakIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3c0 4-4 6-4 10a4 4 0 008 0c0-4-4-6-4-10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MatchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 20c0-3.314 2.686-6 6-6h8c3.314 0 6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function FocusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/>
    </svg>
  );
}
