/**
 * Logs a background failure (label, optional context, message).
 */
export function logFailure(label: string, error: unknown, context?: string) {
  const text = error instanceof Error ? error.message : String(error);
  if (context) console.error(label, context, text);
  else console.error(label, text);
}
