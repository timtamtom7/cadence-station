import { Link } from 'react-router-dom';
import './Button.css';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    fullWidth ? 'btn-full' : '',
    loading ? 'btn-loading' : '',
    disabled ? 'btn-disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  const content = children;

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
