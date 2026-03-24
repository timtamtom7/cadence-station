// Firebase Realtime Database service
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, remove, onValue, off, update, serverTimestamp } from 'firebase/database';
import { firebaseConfig } from './config';

// Initialize Firebase
let app = null;
let db = null;

function getDb() {
  if (!db) {
    try {
      app = initializeApp(firebaseConfig);
      db = getDatabase(app);
    } catch (e) {
      console.warn('Firebase not configured. Pairing features will be disabled.');
      return null;
    }
  }
  return db;
}

// ── Presence / Pairing ──────────────────────────────────────────

/**
 * Join the waiting queue for a given duration.
 * Returns a function to remove the entry.
 */
export async function joinWaitingQueue(sessionId, durationMinutes) {
  const database = getDb();
  if (!database) return () => {};

  const queueRef = ref(database, `queue/${durationMinutes}`);
  const sessionRef = ref(database, `queue/${durationMinutes}/${sessionId}`);

  await set(sessionRef, {
    sessionId,
    joinedAt: serverTimestamp(),
    goal: null, // will be updated separately
  });

  // Try to find a match
  const snapshot = await get(queueRef);
  const entries = snapshot.val() || {};
  const otherSessions = Object.entries(entries).filter(([id]) => id !== sessionId);

  if (otherSessions.length > 0) {
    // Match with the first waiting person
    const [matchId, matchData] = otherSessions[0];
    const pairId = `${Math.min(sessionId, matchId)}_${Math.max(sessionId, matchId)}`;

    await createPair(pairId, sessionId, matchId, durationMinutes);
    await remove(ref(database, `queue/${durationMinutes}/${matchId}`));
    await remove(sessionRef);

    return { pairId, partnerId: matchId, matched: true };
  }

  return { pairId: null, matched: false };
}

/**
 * Remove from waiting queue
 */
export async function leaveWaitingQueue(sessionId, durationMinutes) {
  const database = getDb();
  if (!database) return;
  await remove(ref(database, `queue/${durationMinutes}/${sessionId}`));
}

/**
 * Create a paired session record
 */
export async function createPair(pairId, sessionAId, sessionBId, durationMinutes) {
  const database = getDb();
  if (!database) return;

  await set(ref(database, `pairs/${pairId}`), {
    sessionAId,
    sessionBId,
    durationMinutes,
    matchedAt: serverTimestamp(),
    completedA: false,
    completedB: false,
    endedEarlyA: false,
    endedEarlyB: false,
  });
}

/**
 * Mark a session as completed
 */
export async function markCompleted(pairId, sessionId) {
  const database = getDb();
  if (!database) return;

  const pairRef = ref(database, `pairs/${pairId}`);
  const snapshot = await get(pairRef);
  const pair = snapshot.val();
  if (!pair) return;

  const isA = pair.sessionAId === sessionId;
  const updates = {
    [isA ? 'completedA' : 'completedB']: true,
    [isA ? 'completedAtA' : 'completedAtB']: serverTimestamp(),
  };
  await update(pairRef, updates);
}

/**
 * Mark a session as ended early
 */
export async function markEndedEarly(pairId, sessionId) {
  const database = getDb();
  if (!database) return;

  const pairRef = ref(database, `pairs/${pairId}`);
  const snapshot = await get(pairRef);
  const pair = snapshot.val();
  if (!pair) return;

  const isA = pair.sessionAId === sessionId;
  await update(pairRef, {
    [isA ? 'endedEarlyA' : 'endedEarlyB']: true,
    [isA ? 'endedEarlyAtA' : 'endedEarlyAtB']: serverTimestamp(),
  });
}

/**
 * Subscribe to pair state changes
 */
export function subscribeToPair(pairId, callback) {
  const database = getDb();
  if (!database) return () => {};

  const pairRef = ref(database, `pairs/${pairId}`);
  onValue(pairRef, (snapshot) => {
    callback(snapshot.val());
  });

  return () => off(pairRef);
}

/**
 * Get current waiting count for a duration
 */
export function subscribeToQueueCount(durationMinutes, callback) {
  const database = getDb();
  if (!database) {
    callback(0);
    return () => {};
  }

  const queueRef = ref(database, `queue/${durationMinutes}`);
  onValue(queueRef, (snapshot) => {
    const entries = snapshot.val() || {};
    callback(Object.keys(entries).length);
  });

  return () => off(queueRef);
}

/**
 * Update goal for a waiting session
 */
export async function updateSessionGoal(sessionId, durationMinutes, goal) {
  const database = getDb();
  if (!database) return;
  await update(ref(database, `queue/${durationMinutes}/${sessionId}`), { goal });
}

/**
 * Clean up pair data (called after session ends)
 */
export async function cleanupPair(pairId) {
  const database = getDb();
  if (!database) return;
  await remove(ref(database, `pairs/${pairId}`));
}

// ── Solo Sessions (localStorage + Firebase for cross-device) ──

const SESSIONS_KEY = 'cadence_station_sessions';

export function getSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session) {
  const sessions = getSessions();
  sessions.unshift(session);
  // Keep last 200 sessions
  if (sessions.length > 200) sessions.splice(200);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// ── Streaks ──────────────────────────────────────────────────────

const STREAK_KEY = 'cadence_station_streak';

export function getStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : { current: 0, longest: 0, lastDate: null };
  } catch {
    return { current: 0, longest: 0, lastDate: null };
  }
}

export function updateStreak() {
  const streak = getStreak();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (streak.lastDate === today) {
    // Already counted today
    return streak;
  }

  if (streak.lastDate === yesterday) {
    // Consecutive day
    streak.current += 1;
  } else {
    // Streak broken or first session
    streak.current = 1;
  }

  streak.lastDate = today;
  if (streak.current > streak.longest) streak.longest = streak.current;
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  return streak;
}
