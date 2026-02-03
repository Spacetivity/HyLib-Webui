/**
 * Validates HyLib tag strings – unclosed tags, invalid hex, unknown tags.
 */

const TAG_PATTERN = new RegExp("<(/?)([a-zA-Z0-9_]+)(?::([^>]+))?>", "g");

const KNOWN_TAGS = new Set([
  "color", "c", "colour", "grnt", "gradient",
  "bold", "b", "italic", "i", "em", "underline", "u",
  "monospace", "mono", "link", "url", "reset", "r",
  "black", "dark_blue", "dark_green", "dark_aqua", "dark_red", "dark_purple",
  "gold", "gray", "dark_gray", "blue", "green", "aqua", "red",
  "light_purple", "yellow", "white",
]);

const SELF_CLOSING = new Set(["reset", "r"]);

function parseHexColor(hex: string): boolean {
  try {
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return false;
    parseInt(clean.substring(0, 2), 16);
    parseInt(clean.substring(2, 4), 16);
    parseInt(clean.substring(4, 6), 16);
    return true;
  } catch {
    return false;
  }
}

export interface ValidationWarning {
  type: "unclosed" | "invalid_hex" | "unknown_tag";
  message: string;
  tag?: string;
}

export function validate(text: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  if (!text.includes("<")) return warnings;

  const stack: string[] = [];

  for (const match of text.matchAll(TAG_PATTERN)) {
    const isClosing = match[1] === "/";
    const tagName = match[2].toLowerCase();
    const tagArg = match[3];

    if (isClosing) {
      const idx = stack.lastIndexOf(tagName);
      if (idx === -1) {
        warnings.push({ type: "unclosed", message: `Closing tag </${tagName}> has no matching opening tag`, tag: tagName });
      } else {
        stack.splice(idx, 1);
      }
      continue;
    }

    if (!SELF_CLOSING.has(tagName)) {
      stack.push(tagName);
    }

    if (!KNOWN_TAGS.has(tagName)) {
      warnings.push({ type: "unknown_tag", message: `Unknown tag: <${tagName}>`, tag: tagName });
    }

    if (tagArg) {
      if (tagName === "color" || tagName === "c" || tagName === "colour") {
        const key = tagArg.toLowerCase();
        if (!KNOWN_TAGS.has(key) && !parseHexColor(tagArg)) {
          warnings.push({ type: "invalid_hex", message: `Invalid color: ${tagArg}`, tag: tagName });
        }
      }
      if (tagName === "gradient" || tagName === "grnt") {
        for (const part of tagArg.split(":")) {
          const p = part.trim();
          const key = p.toLowerCase();
          if (!KNOWN_TAGS.has(key) && !parseHexColor(p)) {
            warnings.push({ type: "invalid_hex", message: `Invalid gradient color: ${p}`, tag: tagName });
            break;
          }
        }
      }
    }
  }

  for (const tag of stack) {
    warnings.push({ type: "unclosed", message: `Unclosed tag: <${tag}>`, tag });
  }

  return warnings;
}
