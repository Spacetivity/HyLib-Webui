/**
 * Placeholder input section – {0}=value, {1}=value, etc.
 */

export function createPlaceholdersSection(
  initialValue: string,
  onChange: (value: string) => void
): HTMLElement {
  const section = document.createElement("div");
  section.className = "placeholders-section";

  const label = document.createElement("label");
  label.textContent = "Placeholders (optional)";
  section.appendChild(label);

  const hint = document.createElement("span");
  hint.className = "placeholders-hint";
  hint.textContent = "e.g. {0}=Spieler, {1}=5 — one per line";
  section.appendChild(hint);

  const textarea = document.createElement("textarea");
  textarea.className = "placeholders-input";
  textarea.value = initialValue;
  textarea.placeholder = "{0}=Spieler\n{1}=5";
  textarea.rows = 2;
  section.appendChild(textarea);

  textarea.addEventListener("input", () => onChange(textarea.value));

  return section;
}
