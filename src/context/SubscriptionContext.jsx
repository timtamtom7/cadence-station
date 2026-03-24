import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SubscriptionContext = createContext(null);

export const TIERS = {
  FREE: 'free',
  PRO: 'pro',
  PREMIUM: 'premium',
};

export const TIER_LIMITS = {
  [TIERS.FREE]: {
    sessionsPerDay: 3,
    ambientSounds: ['none', 'brownNoise', 'whiteNoise', 'cafe', 'rain', 'forest', 'ocean'], // All available (6 sounds)
    hasAnalytics: false,
    hasCalendarIntegration: false,
    hasTeamSessions: false,
    hasAdvancedAnalytics: false,
    hasPrioritySupport: false,
    name: 'Free',
    price: 0,
  },
  [TIERS.PRO]: {
    sessionsPerDay: Infinity,
    ambientSounds: ['none', 'brownNoise', 'whiteNoise', 'cafe', 'rain', 'forest', 'ocean'],
    hasAnalytics: true,
    hasCalendarIntegration: true,
    hasTeamSessions: false,
    hasAdvancedAnalytics: false,
    hasPrioritySupport: false,
    name: 'Pro',
    price: 4.99,
  },
  [TIERS.PREMIUM]: {
    sessionsPerDay: Infinity,
    ambientSounds: ['none', 'brownNoise', 'whiteNoise', 'cafe', 'rain', 'forest', 'ocean'],
    hasAnalytics: true,
    hasCalendarIntegration: true,
    hasTeamSessions: true,
    hasAdvancedAnalytics: true,
    hasPrioritySupport: true,
    name: 'Premium',
    price: 9.99,
  },
};

const SESSION_COUNT_KEY = 'cadence_session_count';
const SESSION_DATE_KEY = 'cadence_session_date';
const TIER_KEY = 'cadence_tier';
const ONBOARDING_KEY = 'cadence_onboarding_done';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getTodaySessionCount() {
  const storedDate = localStorage.getItem(SESSION_DATE_KEY);
  const today = getTodayStr();
  if (storedDate !== today) {
    localStorage.setItem(SESSION_DATE_KEY, today);
    localStorage.setItem(SESSION_COUNT_KEY, '0');
    return 0;
  }
  return parseInt(localStorage.getItem(SESSION_COUNT_KEY) || '0');
}

function incrementSessionCount() {
  const count = getTodaySessionCount();
  localStorage.setItem(SESSION_COUNT_KEY, String(count + 1));
}

export function SubscriptionProvider({ children }) {
  const [tier, setTierState] = useState(() => {
    return localStorage.getItem(TIER_KEY) || TIERS.FREE;
  });

  const [todayCount, setTodayCount] = useState(getTodaySessionCount);

  const setTier = useCallback((newTier) => {
    setTierState(newTier);
    localStorage.setItem(TIER_KEY, newTier);
  }, []);

  const recordSession = useCallback(() => {
    incrementSessionCount();
    setTodayCount(getTodaySessionCount());
  }, []);

  const getLimits = useCallback(() => {
    return TIER_LIMITS[tier] || TIER_LIMITS[TIERS.FREE];
  }, [tier]);

  const canStartSession = useCallback(() => {
    const limits = getLimits();
    if (!isFinite(limits.sessionsPerDay)) return { allowed: true, reason: null };
    return {
      allowed: todayCount < limits.sessionsPerDay,
      reason: todayCount >= limits.sessionsPerDay
        ? `You've used your ${limits.sessionsPerDay} free session${limits.sessionsPerDay !== 1 ? 's' : ''} today. Upgrade to Pro for unlimited sessions.`
        : null,
    };
  }, [todayCount, getLimits]);

  const isOnboardingDone = useCallback(() => {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  }, []);

  const value = {
    tier,
    setTier,
    todayCount,
    recordSession,
    getLimits,
    canStartSession,
    isOnboardingDone,
    completeOnboarding,
    TIER_LIMITS,
    TIERS,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
