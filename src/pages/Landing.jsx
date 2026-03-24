import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/shared/Button';
import { DurationPicker } from '../components/shared/DurationPicker';
import { SessionTypePicker } from '../components/shared/SessionTypePicker';
import './Landing.css';

export function Landing() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(25);
  const [sessionType, setSessionType] = useState('solo');

  const handleStart = () => {
    navigate(`/app/session/new?duration=${duration}&type=${sessionType}`);
  };

  return (
    <div className="landing page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo">
          <LogoIcon />
          <span>Cadence Station</span>
        </div>
        <Button variant="ghost" to="/app">Open App</Button>
      </header>

      {/* Hero */}
      <section className="landing-hero">
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

      {/* Footer */}
      <footer className="landing-footer">
        <p>No accounts. No leaderboards. No noise — just focus.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card card">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
    </div>
  );
}

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
