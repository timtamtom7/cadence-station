import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSubscription, TIERS, TIER_LIMITS } from '../context/SubscriptionContext';
import { Button } from '../components/shared/Button';
import './Settings.css';

const INTEGRATIONS_KEY = 'cadence_integrations';

// Integration state shape
// {
//   googleCalendar: { connected: false, syncEnabled: false },
//   notion: { connected: false, pageId: '' },
//   slack: { connected: false, channel: '' },
// }

function loadIntegrations() {
  try {
    return JSON.parse(localStorage.getItem(INTEGRATIONS_KEY) || '{}');
  } catch { return {}; }
}

function saveIntegrations(data) {
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(data));
}

const DEFAULT_DURATION_KEY = 'cadence_default_duration';
const SOUND_KEY = 'cadence_default_sound';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { tier, todayCount } = useSubscription();
  const [defaultDuration, setDefaultDuration] = useState(() => {
    return parseInt(localStorage.getItem(DEFAULT_DURATION_KEY) || '25');
  });
  const [defaultSound, setDefaultSound] = useState(() => {
    return localStorage.getItem(SOUND_KEY) || 'none';
  });
  const [saved, setSaved] = useState(false);
  const [integrations, setIntegrations] = useState(loadIntegrations);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showNotionModal, setShowNotionModal] = useState(false);
  const [showSlackModal, setShowSlackModal] = useState(false);

  const limits = useSubscription().getLimits();
  const hasCalendarInt = limits.hasCalendarIntegration;
  const hasProFeatures = tier !== TIERS.FREE;

  const handleSave = () => {
    localStorage.setItem(DEFAULT_DURATION_KEY, String(defaultDuration));
    localStorage.setItem(SOUND_KEY, defaultSound);
    saveIntegrations(integrations);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateIntegration = (key, values) => {
    setIntegrations((prev) => ({ ...prev, [key]: { ...prev[key], ...values } }));
  };

  const handleClearData = () => {
    if (window.confirm('Clear all session history and streak data? This cannot be undone.')) {
      localStorage.removeItem('cadence_station_sessions');
      localStorage.removeItem('cadence_station_streak');
      window.location.reload();
    }
  };

  return (
    <div className="settings-page page page-enter">
      {/* Header */}
      <header className="settings-header">
        <div className="settings-header-left">
          <Link to="/app" className="back-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Link>
          <h1 className="settings-title">Settings</h1>
        </div>
      </header>

      <main className="settings-main">
        {/* Defaults */}
        <section className="settings-section">
          <h2 className="section-title">Session Defaults</h2>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Default duration</span>
              <span className="setting-desc">Pre-selected when starting a new session</span>
            </div>
            <select
              className="setting-select"
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(parseInt(e.target.value))}
            >
              <option value={25}>25 minutes</option>
              <option value={50}>50 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Default ambient sound</span>
              <span className="setting-desc">Pre-selected when starting a new session</span>
            </div>
            <select
              className="setting-select"
              value={defaultSound}
              onChange={(e) => setDefaultSound(e.target.value)}
            >
              <option value="none">None</option>
              <option value="brownNoise">Brown Noise</option>
              <option value="whiteNoise">White Noise</option>
              <option value="cafe">Café</option>
              <option value="rain">Rain</option>
              <option value="forest">Forest</option>
              <option value="ocean">Ocean</option>
            </select>
          </div>
        </section>

        {/* Appearance */}
        <section className="settings-section">
          <h2 className="section-title">Appearance</h2>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Theme</span>
              <span className="setting-desc">Choose your preferred look</span>
            </div>
            <div className="theme-toggle">
              <button
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => theme !== 'dark' && toggleTheme()}
              >
                <MoonIcon />
                Dark
              </button>
              <button
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => theme !== 'light' && toggleTheme()}
              >
                <SunIcon />
                Light
              </button>
            </div>
          </div>
        </section>

        {/* Data */}
        <section className="settings-section">
          <h2 className="section-title">Data</h2>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Session history</span>
              <span className="setting-desc">Stored locally on this device</span>
            </div>
            <Button variant="danger" size="sm" onClick={handleClearData}>
              Clear data
            </Button>
          </div>
        </section>

        {/* Integrations */}
        <section className="settings-section">
          <h2 className="section-title">Integrations</h2>

          {/* Google Calendar */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">
                <GoogleCalendarIcon /> Google Calendar
              </span>
              <span className="setting-desc">
                {integrations.googleCalendar?.connected
                  ? 'Connected — auto-blocks focus time'
                  : 'Block focus time on your calendar'}
              </span>
            </div>
            {hasCalendarInt ? (
              <Button
                variant={integrations.googleCalendar?.connected ? 'ghost' : 'primary'}
                size="sm"
                onClick={() => {
                  if (integrations.googleCalendar?.connected) {
                    updateIntegration('googleCalendar', { connected: false, syncEnabled: false });
                  } else {
                    setShowCalendarModal(true);
                  }
                }}
              >
                {integrations.googleCalendar?.connected ? 'Disconnect' : 'Connect'}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" to="/pricing">
                Pro required
              </Button>
            )}
          </div>

          {/* Notion */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">
                <NotionIcon /> Notion
              </span>
              <span className="setting-desc">
                {integrations.notion?.connected
                  ? 'Connected — log sessions to a page'
                  : 'Track focus sessions in a Notion database'}
              </span>
            </div>
            {hasProFeatures ? (
              <Button
                variant={integrations.notion?.connected ? 'ghost' : 'primary'}
                size="sm"
                onClick={() => {
                  if (integrations.notion?.connected) {
                    updateIntegration('notion', { connected: false, pageId: '' });
                  } else {
                    setShowNotionModal(true);
                  }
                }}
              >
                {integrations.notion?.connected ? 'Disconnect' : 'Connect'}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" to="/pricing">
                Pro required
              </Button>
            )}
          </div>

          {/* Slack */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">
                <SlackIcon /> Slack
              </span>
              <span className="setting-desc">
                {integrations.slack?.connected
                  ? `Broadcasting to #${integrations.slack.channel || 'focus'}`
                  : "Broadcast your 'focus mode' status"}
              </span>
            </div>
            {hasProFeatures ? (
              <Button
                variant={integrations.slack?.connected ? 'ghost' : 'primary'}
                size="sm"
                onClick={() => {
                  if (integrations.slack?.connected) {
                    updateIntegration('slack', { connected: false, channel: '' });
                  } else {
                    setShowSlackModal(true);
                  }
                }}
              >
                {integrations.slack?.connected ? 'Disconnect' : 'Connect'}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" to="/pricing">
                Pro required
              </Button>
            )}
          </div>

          {/* Push Notifications */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">
                <NotificationIcon /> Push notifications
              </span>
              <span className="setting-desc">
                Session reminders and streak alerts
              </span>
            </div>
            <NotificationToggle integrations={integrations} updateIntegration={updateIntegration} />
          </div>
        </section>

        {/* Subscription */}
        <section className="settings-section">
          <h2 className="section-title">Subscription</h2>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Current plan</span>
              <span className="setting-desc">Your active Cadence Station plan</span>
            </div>
            <div className="subscription-tier-display">
              {tier === TIERS.FREE && (
                <span className="tier-badge tier-free">Free</span>
              )}
              {tier === TIERS.PRO && (
                <span className="tier-badge tier-pro">Pro</span>
              )}
              {tier === TIERS.PREMIUM && (
                <span className="tier-badge tier-premium">Premium</span>
              )}
            </div>
          </div>

          {tier === TIERS.FREE && (
            <div className="setting-row setting-row-upgrade">
              <div className="setting-info">
                <span className="setting-label">Upgrade to Pro</span>
                <span className="setting-desc">Unlimited sessions, focus analytics, calendar integration</span>
              </div>
              <Button variant="primary" size="sm" to="/pricing">
                See plans
              </Button>
            </div>
          )}

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Daily sessions used</span>
              <span className="setting-desc">
                {tier === TIERS.FREE
                  ? `${todayCount} of ${TIER_LIMITS[TIERS.FREE].sessionsPerDay} free sessions today`
                  : 'Unlimited sessions available'}
              </span>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="settings-section">
          <h2 className="section-title">About</h2>

          <div className="about-info">
            <div className="about-row">
              <span className="about-label">Version</span>
              <span className="about-value">1.0.0</span>
            </div>
            <div className="about-row">
              <span className="about-label">Built with</span>
              <span className="about-value">React + Vite + Firebase</span>
            </div>
          </div>

          <p className="about-note">
            Cadence Station — Find your rhythm. Together.
            No accounts, no leaderboards, no noise.
          </p>
        </section>

        {/* Save */}
        <div className="settings-save">
          <Button variant="primary" onClick={handleSave}>
            {saved ? 'Saved!' : 'Save settings'}
          </Button>
        </div>
      </main>
    </div>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1a6 6 0 100 12A6 6 0 007 1z" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.9 2.9l1.4 1.4M9.7 9.7l1.4 1.4M2.9 11.1l1.4-1.4M9.7 4.3l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function NotificationToggle({ integrations, updateIntegration }) {
  const [enabled, setEnabled] = useState(integrations.notifications?.enabled ?? false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof Notification === 'undefined' || !('Notification' in window)) {
      setSupported(false);
    }
  }, []);

  const toggle = async () => {
    if (!enabled) {
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        if (result !== 'granted') return;
      }
      if (Notification.permission === 'denied') {
        setSupported(false);
        return;
      }
    }
    const next = !enabled;
    setEnabled(next);
    updateIntegration('notifications', { enabled: next });
  };

  if (!supported) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Not supported
      </Button>
    );
  }

  return (
    <button
      className={`notif-toggle ${enabled ? 'on' : 'off'}`}
      onClick={toggle}
      aria-pressed={enabled}
    >
      <span className="notif-toggle-thumb" />
    </button>
  );
}

function GoogleCalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}>
      <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1.5 5.5h11M4.5 1v3M9.5 1v3M4 8h2M7 8h2M4 10.5h2M7 10.5h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  );
}

function NotionIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}>
      <rect x="2" y="1.5" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4 4.5h6M4 6.5h6M4 8.5h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  );
}

function SlackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}>
      <path d="M5 3.5a1.5 1.5 0 013 0 1.5 1.5 0 01-3 0zM5 9.5a1.5 1.5 0 013 0 1.5 1.5 0 01-3 0zM3.5 5a1.5 1.5 0 000 3 1.5 1.5 0 000-3zM9.5 5a1.5 1.5 0 000 3 1.5 1.5 0 000-3z" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}>
      <path d="M7 1.5a4 4 0 014 4v2.5l1.5 2H1.5L3 7.5V5.5a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M5.5 11a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
