/* ============================
   VeraVal — Auth Form Validation
   ============================ */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required.";
  if (email.length > 100) return "Email must be 100 characters or less.";
  if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password.length > 100) return "Password must be 100 characters or less.";
  return null;
}

export function validateUsername(username: string): string | null {
  if (!username.trim()) return "Username is required.";
  if (username.length < 3) return "Username must be at least 3 characters.";
  if (username.length > 20) return "Username must be 20 characters or less.";
  if (!USERNAME_REGEX.test(username))
    return "Username can only contain letters, numbers, and underscores.";
  return null;
}

export function validateLoginForm(fields: {
  identifier: string;
  password: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const identifier = fields.identifier || "";
  if (!identifier.trim()) {
    errors.identifier = "Email or Username is required.";
  } else if (identifier.includes("@")) {
    const emailErr = validateEmail(identifier);
    if (emailErr) errors.identifier = emailErr;
  } else {
    const usernameErr = validateUsername(identifier);
    if (usernameErr) errors.identifier = usernameErr;
  }

  const passErr = validatePassword(fields.password);
  if (passErr) errors.password = passErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateRegisterForm(fields: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const usernameErr = validateUsername(fields.username);
  if (usernameErr) errors.username = usernameErr;

  const emailErr = validateEmail(fields.email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(fields.password);
  if (passErr) errors.password = passErr;

  if (!fields.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
