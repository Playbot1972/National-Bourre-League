/** Independent tie/co-win readable latch for app.js next-hand gating (not hand/trick SM). */

let latched = false;

export function setCoWinResultLatched(value: boolean): void {
  latched = value;
}

export function isCoWinResultLatched(): boolean {
  return latched;
}

export function resetCoWinResultLatchBridge(): void {
  latched = false;
}
