import { describe, expect, it } from 'vitest';

import { validateEmail } from './emailValidation';

describe('validateEmail', () => {
  it.each(['name@company.com', 'first.last@sub.example.co.uk', '  padded@example.com  '])(
    'accepts %j',
    (value) => {
      expect(validateEmail(value)).toBeUndefined();
    },
  );

  it.each(['', '   '])('asks for an email when empty (%j)', (value) => {
    expect(validateEmail(value)).toBe('Enter your email address.');
  });

  it.each([
    'name',
    'name@',
    '@example.com',
    'name@example',
    'name@@example.com',
    'first last@example.com',
    'name@example..com',
    `${'a'.repeat(250)}@example.com`,
  ])('rejects %j', (value) => {
    expect(validateEmail(value)).toBe('Enter a valid email address, for example name@company.com.');
  });
});
