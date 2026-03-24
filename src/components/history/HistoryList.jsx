import './HistoryList.css';

export function HistoryList({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="history-empty">
        <EmptyIcon />
        <p>No sessions yet. Start your first one.</p>
      </div>
    );
  }

  // Group by date
  const grouped = {};
  sessions.forEach((s) => {
    const date = new Date(s.startedAt).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(s);
  });

  return (
    <div className="history-list">
      {Object.entries(grouped).map(([date, daySessions]) => (
        <div key={date} className="history-day">
          <h3 className="history-date">{date}</h3>
          <div className="history-sessions">
            {daySessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SessionCard({ session }) {
  const duration = session.durationWorked || session.duration;
  const time = new Date(session.startedAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const isPaired = session.type === 'paired';

  return (
    <div className={`session-card ${session.completed ? 'completed' : 'partial'}`}>
      <div className="session-card-left">
        <span className="session-time">{time}</span>
        <div className="session-info">
          <span className="session-duration">{duration} min {isPaired ? '· Paired' : '· Solo'}</span>
          {session.goal && <span className="session-goal">{session.goal}</span>}
          {session.reflection && (
            <span className="session-reflection">"{session.reflection}"</span>
          )}
        </div>
      </div>
      <div className="session-card-right">
        {session.completed ? (
          <span className="session-status done">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Done
          </span>
        ) : (
          <span className="session-status partial">
            {Math.round((session.endedAt - session.startedAt) / 60000)}m
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ opacity: 0.3 }}>
      <rect x="6" y="10" width="28" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13 6v4M27 6v4M6 18h28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
