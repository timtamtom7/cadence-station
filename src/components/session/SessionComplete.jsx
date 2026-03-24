import { useState } from 'react';
import { Button } from '../shared/Button';
import './SessionComplete.css';

export function SessionComplete({ session, onSave, onDismiss }) {
  const [reflection, setReflection] = useState('');
  const [saved, setSaved] = useState(false);

  const minutesWorked = session.durationWorked || session.duration;
  const formattedDuration = `${minutesWorked} minute${minutesWorked !== 1 ? 's' : ''}`;

  const handleSave = () => {
    onSave({ ...session, reflection: reflection.trim() || null });
    setSaved(true);
  };

  return (
    <div className="session-complete page-enter">
      <div className="complete-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="var(--color-accent)" strokeWidth="2.5"/>
          <path d="M15 24l7 7 11-13" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h2 className="complete-title">Session complete.</h2>
      <p className="complete-subtitle">
        {formattedDuration} of focused work.
      </p>

      {session.type === 'paired' && (
        <p className="complete-partner">
          Your partner wrapped up too. Quiet celebration.
        </p>
      )}

      {!saved ? (
        <div className="complete-reflection">
          <label className="reflection-label" htmlFor="reflection">
            What did you work on? <span className="optional">(optional)</span>
          </label>
          <textarea
            id="reflection"
            className="reflection-input"
            placeholder="Jotted down ideas, finished a draft, crushed that problem..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={3}
          />
          <div className="complete-actions">
            <Button variant="ghost" onClick={() => onSave({ ...session, reflection: null })}>
              Skip
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Session
            </Button>
          </div>
        </div>
      ) : (
        <div className="complete-saved">
          <span className="saved-check">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-7" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Session saved
          </span>
          <Button variant="primary" onClick={onDismiss}>
            Back to Home
          </Button>
        </div>
      )}
    </div>
  );
}
