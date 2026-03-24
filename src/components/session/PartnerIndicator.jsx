import './PartnerIndicator.css';

export function PartnerIndicator({ partnerName, status, partnerEndedEarly }) {
  // status: 'connected' | 'waiting' | 'ended_early'
  // partnerEndedEarly: bool

  if (status === 'waiting') {
    return (
      <div className="partner-indicator waiting">
        <div className="partner-pulse" />
        <span>Waiting for partner...</span>
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
