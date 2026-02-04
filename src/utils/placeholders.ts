/**
 * Replaces placeholders {0}, {1}, etc. with values from a map.
 * Supports prefix extraction: prefix=... or {prefix}=...
 */

export interface ParsedPlaceholders {
  map: Map<string, string>;
  prefix: string | null;
}

export function parsePlaceholderMap(input: string): Map<string, string> {
  const parsed = parsePlaceholderMapWithPrefix(input);
  return parsed.map;
}

export function parsePlaceholderMapWithPrefix(input: string): ParsedPlaceholders {
  const map = new Map<string, string>();
  let prefix: string | null = null;
  const lines = input.trim().split(/\r?\n/);
  
  for (const line of lines) {
    const eq = line.indexOf("=");
    if (eq > 0) {
      const key = line.slice(0, eq).trim();
      const value = line.slice(eq + 1).trim();
      if (key) {
        // Check if this is a prefix definition
        const normalizedKey = key.toLowerCase();
        if (normalizedKey === "prefix" || normalizedKey === "{prefix}") {
          prefix = value;
          // Don't add prefix to the map - it's handled separately
          continue;
        }
        
        const normKey = key.startsWith("{") && key.endsWith("}") ? key : `{${key}}`;
        map.set(normKey, value);
      }
    }
  }
  
  return { map, prefix };
}

export function applyPlaceholders(text: string, map: Map<string, string>, prefix: string | null = null): string {
  let result = text;
  
  // Apply prefix first (before other placeholders)
  if (prefix !== null) {
    result = result.replace(/\{prefix\}/g, prefix);
  } else {
    // If no prefix defined, replace {prefix} with empty string
    result = result.replace(/\{prefix\}/g, "");
  }
  
  // Apply other placeholders
  if (map.size > 0) {
    for (const [key, value] of map) {
      const inner = key.replace(/^\{|\}$/g, "");
      const escaped = inner.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(`\\{${escaped}\\}`, "g"), value);
    }
  }
  
  return result;
}
