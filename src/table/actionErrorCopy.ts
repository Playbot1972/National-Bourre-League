/** Scrub raw Firebase INTERNAL messages before showing under the hero hand. */
export function scrubInternalActionMessage(message: string | null | undefined): string | null {
  const text = String(message ?? "").trim();
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower === "internal" || lower.includes("internal error")) {
    return "The server could not finish that table action. Refresh the page and try again.";
  }
  return text;
}
