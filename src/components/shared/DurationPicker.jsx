import './DurationPicker.css';

const DURATIONS = [
  { value: 25, label: '25 min', description: 'Quick focus' },
  { value: 50, label: '50 min', description: 'Standard Pomodoro' },
  { value: 90, label: '90 min', description: 'Deep work' },
];

export function DurationPicker({ value, onChange }) {
  return (
    <div className="duration-picker">
      {DURATIONS.map((d) => (
        <button
          key={d.value}
          type="button"
          className={`duration-option ${value === d.value ? 'active' : ''}`}
          onClick={() => onChange(d.value)}
          aria-pressed={value === d.value}
        >
          <span className="duration-value">{d.label}</span>
          <span className="duration-desc">{d.description}</span>
        </button>
      ))}
    </div>
  );
}
