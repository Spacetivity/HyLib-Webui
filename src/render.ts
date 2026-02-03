/**
 * Renders MessageSegment[] to HTML for preview.
 * Handles color, gradient (per-char), bold, italic, underline, monospace, links.
 */

import type { MessageSegment, Rgb } from "./parser.js";

function rgbToCss(rgb: Rgb): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function segmentToHtml(seg: MessageSegment): string {
  const styles: string[] = [];
  const classes: string[] = [];

  if (seg.color) {
    styles.push(`color: ${rgbToCss(seg.color)}`);
  }
  if (seg.bold) classes.push("bold");
  if (seg.italic) classes.push("italic");
  if (seg.underline) classes.push("underline");
  if (seg.monospace) classes.push("mono");

  const cls = classes.length > 0 ? ` class="${classes.join(" ")}"` : "";
  const style = styles.length > 0 ? ` style="${styles.join("; ")}"` : "";
  const escaped = escapeHtml(seg.text);

  if (seg.link) {
    const href = escapeAttr(seg.link);
    return `<a href="${href}" target="_blank" rel="noopener noreferrer"${cls}${style}>${escaped}</a>`;
  }

  return `<span${cls}${style}>${escaped}</span>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/**
 * Renders a list of segments to an HTML string for the preview area.
 */
export function renderToHtml(segments: MessageSegment[]): string {
  if (segments.length === 0) return "";
  return segments.map(segmentToHtml).join("");
}
