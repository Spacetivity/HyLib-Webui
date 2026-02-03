/**
 * Replaces placeholders {0}, {1}, etc. with values from a map.
 */

export function parsePlaceholderMap(input: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = input.trim().split(/\r?\n/);
  for (const line of lines) {
    const eq = line.indexOf("=");
    if (eq > 0) {
      const key = line.slice(0, eq).trim();
      const value = line.slice(eq + 1).trim();
      if (key) {
        const normKey = key.startsWith("{") && key.endsWith("}") ? key : `{${key}}`;
        map.set(normKey, value);
      }
    }
  }
  return map;
}

export function applyPlaceholders(text: string, map: Map<string, string>): string {
  if (map.size === 0) return text;
  let result = text;
  for (const [key, value] of map) {
    const inner = key.replace(/^\{|\}$/g, "");
    const escaped = inner.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(`\\{${escaped}\\}`, "g"), value);
  }
  return result;
}
