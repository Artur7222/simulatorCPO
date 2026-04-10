export function hasMinLength(text: string, minLength: number): boolean {
  // Rule agreed for MVP: trim edge spaces and then count remaining characters.
  return text.trim().length >= minLength;
}
