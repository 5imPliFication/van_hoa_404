// Per-browser settings. Storage can be unavailable (private mode, blocked site data), so every access is guarded.
const CLASS_MODE_KEY = 'vanhoa404_class_mode';

// Classroom mode: the player takes half damage so every classmate survives long enough to meet all scenarios.
export const CLASS_MODE_DAMAGE_MULTIPLIER = 0.5;

// In-memory fallback so the toggle still works for this session when storage is blocked
let classModeFallback = false;

export function isClassMode(): boolean {
  try {
    const stored = localStorage.getItem(CLASS_MODE_KEY);
    return stored === null ? classModeFallback : stored === 'true';
  } catch {
    return classModeFallback;
  }
}

export function setClassMode(on: boolean): void {
  classModeFallback = on;
  try {
    localStorage.setItem(CLASS_MODE_KEY, on ? 'true' : 'false');
  } catch {}
}
