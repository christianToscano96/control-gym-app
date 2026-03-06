/**
 * Escapes special regex characters from user input to prevent ReDoS attacks.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
