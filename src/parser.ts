/**
 * Port of MessageParserImpl.java – parses HyLib format tags into segments.
 * Tag syntax: <tag>, </tag>, <tag:arg>
 * Regex: <(/?)([a-zA-Z0-9_]+)(?::([^>]+))?>
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface MessageSegment {
  text: string;
  color?: Rgb;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  monospace?: boolean;
  link?: string;
}

const TAG_PATTERN = new RegExp("<(/?)([a-zA-Z0-9_]+)(?::([^>]+))?>", "g");

const NAMED_COLORS: Record<string, Rgb> = {
  black: { r: 0, g: 0, b: 0 },
  dark_blue: { r: 0, g: 0, b: 170 },
  dark_green: { r: 0, g: 170, b: 0 },
  dark_aqua: { r: 0, g: 170, b: 170 },
  dark_red: { r: 170, g: 0, b: 0 },
  dark_purple: { r: 170, g: 0, b: 170 },
  gold: { r: 255, g: 170, b: 0 },
  gray: { r: 170, g: 170, b: 170 },
  dark_gray: { r: 85, g: 85, b: 85 },
  blue: { r: 85, g: 85, b: 255 },
  green: { r: 85, g: 255, b: 85 },
  aqua: { r: 85, g: 255, b: 255 },
  red: { r: 255, g: 85, b: 85 },
  light_purple: { r: 255, g: 85, b: 255 },
  yellow: { r: 255, g: 255, b: 85 },
  white: { r: 255, g: 255, b: 255 },
};

interface MessageFormat {
  color: Rgb | null;
  gradient: Rgb[] | null;
  bold: boolean;
  italic: boolean;
  underlined: boolean;
  monospace: boolean;
  link: string | null;
}

function emptyFormat(): MessageFormat {
  return {
    color: null,
    gradient: null,
    bold: false,
    italic: false,
    underlined: false,
    monospace: false,
    link: null,
  };
}

function parseColorArg(arg: string | undefined): Rgb | null {
  if (!arg) return null;
  const key = arg.toLowerCase();
  if (NAMED_COLORS[key]) return NAMED_COLORS[key];
  return parseHexColor(arg);
}

function parseHexColor(hex: string): Rgb | null {
  try {
    const clean = hex.replace("#", "");
    if (clean.length === 6) {
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      return { r, g, b };
    }
    return null;
  } catch {
    return null;
  }
}

function parseGradientColors(arg: string): Rgb[] {
  const colors: Rgb[] = [];
  for (const part of arg.split(":")) {
    const c = parseColorArg(part.trim());
    if (c) colors.push(c);
  }
  return colors;
}

function interpolateColor(colors: Rgb[], progress: number): Rgb {
  const clamped = Math.max(0, Math.min(1, progress));
  const scaled = clamped * (colors.length - 1);
  const index = Math.min(Math.floor(scaled), colors.length - 2);
  const local = scaled - index;

  const c1 = colors[index];
  const c2 = colors[index + 1];

  return {
    r: Math.round(c1.r + (c2.r - c1.r) * local),
    g: Math.round(c1.g + (c2.g - c1.g) * local),
    b: Math.round(c1.b + (c2.b - c1.b) * local),
  };
}

function processOpeningTag(
  tagName: string,
  tagArg: string | undefined,
  current: MessageFormat
): MessageFormat {
  const key = tagName.toLowerCase();
  if (NAMED_COLORS[key]) {
    return { ...current, color: NAMED_COLORS[key], gradient: null };
  }

  switch (key) {
    case "color":
    case "c":
    case "colour": {
      const color = parseColorArg(tagArg);
      return color ? { ...current, color, gradient: null } : current;
    }
    case "grnt":
    case "gradient": {
      if (!tagArg) return current;
      const gradient = parseGradientColors(tagArg);
      return gradient.length > 0 ? { ...current, color: null, gradient } : current;
    }
    case "bold":
    case "b":
      return { ...current, bold: true };
    case "italic":
    case "i":
    case "em":
      return { ...current, italic: true };
    case "underline":
    case "u":
      return { ...current, underlined: true };
    case "monospace":
    case "mono":
      return { ...current, monospace: true };
    case "link":
    case "url":
      return tagArg ? { ...current, link: tagArg } : current;
    case "reset":
    case "r":
      return emptyFormat();
    default:
      return current;
  }
}

function createSegment(
  text: string,
  state: MessageFormat
): MessageSegment[] {
  if (!text) return [];

  if (state.gradient && state.gradient.length > 0) {
    const length = text.length;
    const segments: MessageSegment[] = [];
    for (let i = 0; i < length; i++) {
      const progress = length > 1 ? i / (length - 1) : 0;
      const color = interpolateColor(state.gradient, progress);
      segments.push({
        text: text[i],
        color,
        bold: state.bold || undefined,
        italic: state.italic || undefined,
        underline: state.underlined || undefined,
        monospace: state.monospace || undefined,
        link: state.link ?? undefined,
      });
    }
    return segments;
  }

  const seg: MessageSegment = { text };
  if (state.color) seg.color = state.color;
  if (state.bold) seg.bold = true;
  if (state.italic) seg.italic = true;
  if (state.underlined) seg.underline = true;
  if (state.monospace) seg.monospace = true;
  if (state.link) seg.link = state.link;
  return [seg];
}

/**
 * Parses a string with HyLib format tags into a flat list of styled segments.
 * Matches the behavior of MessageParserImpl.parse() in Java.
 */
export function parse(text: string): MessageSegment[] {
  if (text == null) {
    throw new Error("Text cannot be null");
  }

  if (!text.includes("<")) {
    return text ? [{ text }] : [];
  }

  const segments: MessageSegment[] = [];
  const stateStack: MessageFormat[] = [emptyFormat()];
  let lastIndex = 0;

  const matcher = text.matchAll(TAG_PATTERN);

  for (const match of matcher) {
    const start = match.index!;
    const end = start + match[0].length;
    const isClosing = match[1] === "/";
    const tagName = match[2];
    const tagArg = match[3];

    // Text before this tag
    if (start > lastIndex) {
      const content = text.slice(lastIndex, start);
      segments.push(...createSegment(content, stateStack[stateStack.length - 1]));
    }

    if (isClosing) {
      if (stateStack.length > 1) stateStack.pop();
      lastIndex = end;
      continue;
    }

    const newState = processOpeningTag(
      tagName,
      tagArg,
      stateStack[stateStack.length - 1]
    );
    stateStack.push(newState);
    lastIndex = end;
  }

  // Remaining text
  if (lastIndex < text.length) {
    const content = text.slice(lastIndex);
    segments.push(...createSegment(content, stateStack[stateStack.length - 1]));
  }

  return segments;
}
