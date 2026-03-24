import { useState, useEffect } from 'react';
import './PartnerIndicator.css';

export function PartnerIndicator({ partnerName, status, partnerEndedEarly }) {
  // status: 'connected' | 'waiting' | 'ended_early'
  // partnerEndedEarly: bool
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (status === 'waiting') {
    return (
      <div className="partner-indicator waiting">
        <div className="partner-pulse" />
        <span>Waiting for partner...</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="partner-indicator offline-indicator">
        <span className="partner-dot offline-dot" />
        <span>Offline — solo mode</span>
      </div>
    );
  }

  if (partnerEndedEarly) {
    return (
      <div className="partner-indicator ended-early">
        <span className="partner-dot ended" />
        <span>{partnerName} ended early</span>
      </div>
    );
  }

  return (
    <div className="partner-indicator connected">
      <span className="partner-dot active" />
      <span>{partnerName} is working...</span>
    </div>
  );
}
