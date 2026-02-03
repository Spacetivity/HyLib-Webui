/**
 * Live preview area for rendered message.
 */

import { parse } from "../parser.js";
import { renderToHtml } from "../render.js";

export function createPreviewSection(): {
  container: HTMLElement;
  update: (rawText: string) => void;
} {
  const section = document.createElement("div");
  section.className = "preview-section";

  const label = document.createElement("label");
  label.textContent = "Preview";
  section.appendChild(label);

  const box = document.createElement("div");
  box.className = "preview-box";
  section.appendChild(box);

  function update(rawText: string): void {
    try {
      const segments = parse(rawText);
      box.innerHTML = renderToHtml(segments);
    } catch (e) {
      box.textContent = `Error: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return { container: section, update };
}
