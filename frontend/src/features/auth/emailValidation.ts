const MAX_EMAIL_LENGTH = 254;
// Pragmatic format check (one "@", no spaces, a dot in the domain). The identity provider is the
// authority on whether an address is real; this only catches obvious typing mistakes.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Returns a user-facing error message, or `undefined` when the email looks valid. */
export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (email === '') {
    return 'Enter your email address.';
  }
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return 'Enter a valid email address, for example name@company.com.';
  }
  return undefined;
}
