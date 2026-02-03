/**
 * Validation warnings display.
 */

import type { ValidationWarning } from "../utils/validator.js";

export function createValidationSection(): {
  container: HTMLElement;
  update: (warnings: ValidationWarning[]) => void;
} {
  const section = document.createElement("div");
  section.className = "validation-section";

  const box = document.createElement("div");
  box.className = "validation-box";
  section.appendChild(box);

  function update(warnings: ValidationWarning[]): void {
    if (warnings.length === 0) {
      box.innerHTML = "";
      box.hidden = true;
      return;
    }
    box.hidden = false;
    box.innerHTML = warnings
      .map((w) => `<span class="validation-warning validation-warning--${w.type}">⚠ ${escapeHtml(w.message)}</span>`)
      .join(" · ");
  }

  return { container: section, update };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
