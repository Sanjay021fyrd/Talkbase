/**
 * Parse a timestamp coming from the API.
 * The backend stores UTC times but sends them without a time-zone marker
 * ("2026-11-22T15:54:59"), which browsers would read as local time (showing "5h ago"
 * for a chat created seconds ago). Treat marker-less values as UTC.
 */
export function parseServerDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const s = String(value);
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(s);
  return new Date(hasZone ? s : `${s}Z`);
}
