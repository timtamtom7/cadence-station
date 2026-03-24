// Achievement badge definitions
export const ACHIEVEMENT_META = {
  firstSession: {
    name: 'First Focus',
    description: 'Complete your first focus session.',
  },
  weekStreak: {
    name: '7-Day Streak',
    description: 'Focus for 7 consecutive days.',
  },
  monthStreak: {
    name: 'Monthly Focus',
    description: 'Focus for 30 consecutive days.',
  },
  tenHours: {
    name: '10 Hours Deep',
    description: 'Accumulate 10 hours of focused time.',
  },
  hundredHours: {
    name: '100 Hours',
    description: 'Accumulate 100 hours of focused time.',
  },
  fiftySessions: {
    name: 'Session Pro',
    description: 'Complete 50 focus sessions.',
  },
  earlyBird: {
    name: 'Early Bird',
    description: 'Start a session before 7am.',
  },
  nightOwl: {
    name: 'Night Owl',
    description: 'Complete a session after 11pm.',
  },
  perfectWeek: {
    name: 'Perfect Week',
    description: 'Complete at least one session every day for a week.',
  },
};

const ACHIEVEMENTS_KEY = 'cadence_station_achievements';

export function getAchievements() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function awardAchievement(key) {
  const earned = getAchievements();
  if (earned.includes(key)) return false;
  earned.push(key);
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(earned));
  return true;
}

export function checkAndAwardAchievements(session) {
  const earned = getAchievements();
  const newlyAwarded = [];

  // firstSession
  if (awardAchievement('firstSession')) {
    newlyAwarded.push('firstSession');
  }

  // weekStreak — check current streak in streak data
  try {
    const streakRaw = localStorage.getItem('cadence_station_streak');
    if (streakRaw) {
      const streak = JSON.parse(streakRaw);
      if (streak.current >= 7) {
        if (awardAchievement('weekStreak')) newlyAwarded.push('weekStreak');
      }
      if (streak.current >= 30) {
        if (awardAchievement('monthStreak')) newlyAwarded.push('monthStreak');
      }
    }
  } catch {}

  // tenHours / hundredHours
  try {
    const sessionsRaw = localStorage.getItem('cadence_station_sessions');
    if (sessionsRaw) {
      const sessions = JSON.parse(sessionsRaw);
      const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationWorked || s.duration), 0);
      if (totalMinutes >= 600 && !earned.includes('tenHours')) {
        if (awardAchievement('tenHours')) newlyAwarded.push('tenHours');
      }
      if (totalMinutes >= 6000 && !earned.includes('hundredHours')) {
        if (awardAchievement('hundredHours')) newlyAwarded.push('hundredHours');
      }
    }
  } catch {}

  // fiftySessions
  try {
    const sessionsRaw = localStorage.getItem('cadence_station_sessions');
    if (sessionsRaw) {
      const sessions = JSON.parse(sessionsRaw);
      const completed = sessions.filter((s) => s.completed).length;
      if (completed >= 50) {
        if (awardAchievement('fiftySessions')) newlyAwarded.push('fiftySessions');
      }
    }
  } catch {}

  // earlyBird / nightOwl
  const hour = new Date(session.startedAt).getHours();
  if (hour < 7) {
    if (awardAchievement('earlyBird')) newlyAwarded.push('earlyBird');
  }
  if (hour >= 23) {
    if (awardAchievement('nightOwl')) newlyAwarded.push('nightOwl');
  }

  return newlyAwarded;
}
