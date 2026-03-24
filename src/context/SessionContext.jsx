import { createContext, useContext, useState, useCallback } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);
  const [ambientSound, setAmbientSound] = useState('none');
  const [ambientVolume, setAmbientVolume] = useState(0.5);

  const startSession = useCallback((options) => {
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      duration: options.duration, // minutes
      type: options.type, // 'solo' | 'paired'
      goal: options.goal || null,
      startedAt: Date.now(),
      endedAt: null,
      completed: false,
      pairId: options.pairId || null,
      partnerId: options.partnerId || null,
    };
    setActiveSession(session);
    return session;
  }, []);

  const endSession = useCallback((completed = false) => {
    if (!activeSession) return null;
    const ended = {
      ...activeSession,
      endedAt: Date.now(),
      completed,
      durationWorked: Math.round((Date.now() - activeSession.startedAt) / 60000),
    };
    setActiveSession(null);
    return ended;
  }, [activeSession]);

  const value = {
    activeSession,
    startSession,
    endSession,
    setActiveSession,
    ambientSound,
    setAmbientSound,
    ambientVolume,
    setAmbientVolume,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
