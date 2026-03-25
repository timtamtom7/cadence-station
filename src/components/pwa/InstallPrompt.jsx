import { useState, useEffect } from 'react';
import './InstallPrompt.css';

let deferredPrompt = null;

window.__cadenceRegisterInstallPrompt = (e) => {
  deferredPrompt = e;
};

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    const handler = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    setCanInstall(false);
    return outcome;
  };

  const dismiss = () => {
    setCanInstall(false);
  };

  return { canInstall: canInstall && !isStandalone, isStandalone, install, dismiss };
}

export function PWANotificationPermission() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [requested, setRequested] = useState(false);

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
    setRequested(true);
    if (result === 'granted' && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.sync && reg.sync.register('sync-sessions');
    }
  };

  if (permission === 'granted' || requested) return null;

  return (
    <div className="pwa-notification-prompt">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1a5 5 0 100 10A5 5 0 007 1zM7 4v3.5M7 9v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
      <span>Enable notifications to never miss a focus reminder.</span>
      <button className="pwa-notif-btn" onClick={requestPermission}>
        Enable
      </button>
    </div>
  );
}
