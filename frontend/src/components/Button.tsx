import type { ComponentPropsWithRef, MouseEvent } from 'react';

import styles from './Button.module.css';

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  /** Shows `loadingLabel`, marks the button busy and ignores clicks. Keeps focus (no `disabled`). */
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
  /** `primary` (default): solid black. `secondary`: outlined, for less prominent actions. */
  variant?: 'primary' | 'secondary';
}

/** Primary action button. Defaults to `type="button"` so it never submits a form by accident. */
export function Button({
  type = 'button',
  loading = false,
  loadingLabel = 'Please wait…',
  fullWidth = false,
  variant = 'primary',
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const classes = [
    styles.button,
    variant === 'secondary' && styles.secondary,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (loading) {
      // Also stops a busy submit button from submitting its form again.
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <button
      type={type}
      className={classes}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={handleClick}
      {...props}
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
