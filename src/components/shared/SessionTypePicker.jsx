import './SessionTypePicker.css';

export function SessionTypePicker({ value, onChange }) {
  return (
    <div className="session-type-picker">
      <button
        type="button"
        className={`type-option ${value === 'solo' ? 'active' : ''}`}
        onClick={() => onChange('solo')}
        aria-pressed={value === 'solo'}
      >
        <span className="type-icon">
          <SoloIcon />
        </span>
        <span className="type-label">Solo</span>
        <span className="type-desc">Work alone, at your own pace</span>
      </button>

      <button
        type="button"
        className={`type-option ${value === 'paired' ? 'active' : ''}`}
        onClick={() => onChange('paired')}
        aria-pressed={value === 'paired'}
      >
        <span className="type-icon">
          <PairedIcon />
        </span>
        <span className="type-label">Paired</span>
        <span className="type-desc">Match with a partner and focus together</span>
      </button>
    </div>
  );
}

function SoloIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function PairedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="7" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="13" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 17c0-2.761 2.239-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13 12c2.761 0 5 2.239 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7.5 14.5l5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 1.5"/>
    </svg>
  );
}
