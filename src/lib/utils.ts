// Simple utility for merging class names (mirrors clsx/cn pattern)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Format phone number for display
export function formatPhone(phone: string): string {
  return phone;
}

// Truncate text to a given length
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

// Generate a deterministic colour index from a string (for placeholders)
export function stringToColourIndex(str: string, total: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % total;
}
