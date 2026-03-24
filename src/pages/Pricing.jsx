import { Link } from 'react-router-dom';
import { useSubscription, TIERS } from '../context/SubscriptionContext';
import { Button } from '../components/shared/Button';
import './Pricing.css';

export function Pricing() {
  const { tier, setTier } = useSubscription();

  const handleSelect = (selectedTier) => {
    setTier(selectedTier);
  };

  const isCurrent = (t) => tier === t;

  return (
    <div className="pricing-page page">
      {/* Header */}
      <header className="pricing-header">
        <div className="pricing-logo">
          <StationIcon />
          <span>Cadence Station</span>
        </div>
        <div className="pricing-header-right">
          <Link to="/app" className="pricing-back-link">
            Back to app
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pricing-hero">
        <div className="pricing-eyebrow">
          <span className="eyebrow-dot" />
          <span>Pricing</span>
        </div>
        <h1 className="pricing-title">Find your plan.</h1>
        <p className="pricing-subtitle">
          Start free. Focus without limits when you're ready.<br />
          No lock-in. No surprises.
        </p>
      </section>

      {/* Tiers */}
      <section className="pricing-tiers">
        {/* Free */}
        <div className={`tier-card ${isCurrent(TIERS.FREE) ? 'current' : ''}`}>
          <div className="tier-header">
            <div className="tier-name-row">
              <span className="tier-name">Free</span>
              {isCurrent(TIERS.FREE) && (
                <span className="tier-current-badge">Current</span>
              )}
            </div>
            <div className="tier-price">
              <span className="tier-amount">$0</span>
              <span className="tier-period">forever</span>
            </div>
            <p className="tier-tagline">Dip in. Get a taste of focused work.</p>
          </div>

          <ul className="tier-features">
            <li className="feature-item included">
              <CheckIcon />
              <span>3 focus sessions per day</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>6 ambient soundscapes</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>Basic session timer</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>Streak tracking</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>Session history</span>
            </li>
            <li className="feature-item excluded">
              <LockIcon />
              <span>
                Focus analytics
                <ProTag />
              </span>
            </li>
            <li className="feature-item excluded">
              <LockIcon />
              <span>
                Calendar integration
                <ProTag />
              </span>
            </li>
            <li className="feature-item excluded">
              <LockIcon />
              <span>
                Team sessions
                <PremiumTag />
              </span>
            </li>
            <li className="feature-item excluded">
              <LockIcon />
              <span>
                Advanced analytics
                <PremiumTag />
              </span>
            </li>
          </ul>

          <div className="tier-footer">
            {isCurrent(TIERS.FREE) ? (
              <Button variant="secondary" fullWidth disabled>
                Current plan
              </Button>
            ) : (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => handleSelect(TIERS.FREE)}
              >
                Downgrade to Free
              </Button>
            )}
          </div>
        </div>

        {/* Pro */}
        <div className={`tier-card tier-featured ${isCurrent(TIERS.PRO) ? 'current' : ''}`}>
          <div className="tier-popular-badge">Most popular</div>
          <div className="tier-header">
            <div className="tier-name-row">
              <span className="tier-name">Pro</span>
              {isCurrent(TIERS.PRO) && (
                <span className="tier-current-badge">Current</span>
              )}
            </div>
            <div className="tier-price">
              <span className="tier-amount">$4.99</span>
              <span className="tier-period">/ month</span>
            </div>
            <p className="tier-tagline">Unlimited sessions. Full focus mode.</p>
          </div>

          <ul className="tier-features">
            <li className="feature-item included">
              <CheckIcon />
              <span><strong>Unlimited</strong> focus sessions</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>All 6 ambient soundscapes</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>Focus analytics dashboard</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>Calendar integration</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>Streak protection</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>Session reflections & notes</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>Weekly focus report</span>
            </li>
            <li className="feature-item excluded">
              <LockIcon />
              <span>
                Team sessions (pair focus)
                <PremiumTag />
              </span>
            </li>
            <li className="feature-item excluded">
              <LockIcon />
              <span>
                Advanced analytics
                <PremiumTag />
              </span>
            </li>
          </ul>

          <div className="tier-footer">
            {isCurrent(TIERS.PRO) ? (
              <Button variant="primary" fullWidth disabled>
                Current plan
              </Button>
            ) : (
              <Button
                variant="primary"
                fullWidth
                onClick={() => handleSelect(TIERS.PRO)}
              >
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>

        {/* Premium */}
        <div className={`tier-card ${isCurrent(TIERS.PREMIUM) ? 'current' : ''}`}>
          <div className="tier-header">
            <div className="tier-name-row">
              <span className="tier-name">Premium</span>
              {isCurrent(TIERS.PREMIUM) && (
                <span className="tier-current-badge">Current</span>
              )}
            </div>
            <div className="tier-price">
              <span className="tier-amount">$9.99</span>
              <span className="tier-period">/ month</span>
            </div>
            <p className="tier-tagline">Go deep. Bring someone with you.</p>
          </div>

          <ul className="tier-features">
            <li className="feature-item included">
              <CheckIcon />
              <span><strong>Everything in Pro</strong></span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>Team sessions — pair focus with a partner</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>Advanced analytics &amp; insights</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>Priority support</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>Custom session goals &amp; tracking</span>
            </li>
            <li className="feature-item included">
              <CheckIcon />
              <span>Monthly focus digest</span>
            </li>
          </ul>

          <div className="tier-footer">
            {isCurrent(TIERS.PREMIUM) ? (
              <Button variant="secondary" fullWidth disabled>
                Current plan
              </Button>
            ) : (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => handleSelect(TIERS.PREMIUM)}
              >
                Upgrade to Premium
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* FAQ / Note */}
      <section className="pricing-note">
        <div className="pricing-note-inner">
          <div className="note-icon">
            <InfoIcon />
          </div>
          <p>
            All plans store your data locally. No account required.
            Subscriptions are processed via the platform you use — no separate billing system.
            Upgrade or downgrade anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="pricing-footer">
        <p>Cadence Station — Find your rhythm. Together.</p>
        <div className="footer-links">
          <Link to="/app">Open app</Link>
          <Link to="/app/history">History</Link>
          <Link to="/app/settings">Settings</Link>
        </div>
      </footer>
    </div>
  );
}

function StationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10" stroke="var(--color-accent)" strokeWidth="2"/>
      <circle cx="14" cy="14" r="5" fill="var(--color-accent)" opacity="0.3"/>
      <circle cx="14" cy="14" r="2.5" fill="var(--color-accent)"/>
      <path d="M14 4v3M14 21v3M4 14h3M21 14h3" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="check-icon">
      <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 7.5l2.5 2.5 4-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="lock-icon">
      <rect x="3" y="7" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function ProTag() {
  return <span className="tier-feature-tag tag-pro">Pro</span>;
}

function PremiumTag() {
  return <span className="tier-feature-tag tag-premium">Premium</span>;
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8 7.5v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
