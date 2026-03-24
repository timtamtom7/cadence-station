import './PartnerRadar.css';

// Animated radar/pulse effect for partner search
export function PartnerRadar({ partnerCount = 0 }) {
  return (
    <div className="partner-radar">
      <div className="radar-core">
        <StationIcon />
      </div>
      {/* Expanding rings */}
      <div className="radar-ring radar-ring-1" />
      <div className="radar-ring radar-ring-2" />
      <div className="radar-ring radar-ring-3" />
      {/* Scanning sweep */}
      <div className="radar-sweep" />
      {/* Floating partner dots */}
      {partnerCount > 0 && (
        <div className="radar-partner-dots">
          {Array.from({ length: Math.min(partnerCount, 5) }).map((_, i) => (
            <div
              key={i}
              className="radar-partner-dot"
              style={{
                '--angle': `${(i / Math.min(partnerCount, 5)) * 360}deg`,
                '--delay': `${i * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StationIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10" stroke="var(--color-accent)" strokeWidth="2"/>
      <circle cx="14" cy="14" r="5" fill="var(--color-accent)" opacity="0.3"/>
      <circle cx="14" cy="14" r="2.5" fill="var(--color-accent)"/>
      <path d="M14 4v3M14 21v3M4 14h3M21 14h3" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
