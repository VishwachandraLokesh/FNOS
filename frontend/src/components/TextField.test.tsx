import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TextField } from './TextField';

describe('TextField', () => {
  it('associates the label and hint with the input', () => {
    render(<TextField label="Email address" hint="Use your work email." />);

    const input = screen.getByRole('textbox', { name: 'Email address' });
    expect(input).toHaveAccessibleDescription('Use your work email.');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('marks the input invalid and describes it with the error message', () => {
    render(<TextField label="Email address" error="Enter your email address." />);

    const input = screen.getByRole('textbox', { name: 'Email address' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter your email address.');
  });

  it('keeps a visually hidden label accessible', () => {
    render(<TextField label="Email address" hideLabel />);

    expect(screen.getByRole('textbox', { name: 'Email address' })).toBeInTheDocument();
  });
});
