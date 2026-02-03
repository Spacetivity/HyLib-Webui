/**
 * Preset example templates.
 */

export interface Template {
  name: string;
  value: string;
}

export const TEMPLATES: Template[] = [
  { name: "Welcome", value: "Welcome, <bold><green>{0}</green></bold>! Have fun playing." },
  { name: "Rainbow", value: "<gradient:red:yellow:green:aqua:blue:light_purple>Rainbow text!</gradient>" },
  { name: "Error", value: "<red><bold>Error:</bold></red> <white>Something went wrong.</white>" },
  { name: "Link", value: "Visit <link:https://hytale.com>Hytale</link> for more info." },
  { name: "Mixed", value: "<bold>Bold</bold> <italic>Italic</italic> <underline>Underline</underline> <monospace>Mono</monospace>" },
  { name: "Reset", value: "<red>Red text</red> <reset>Back to default</reset>" },
];

export function createTemplatesSection(onSelect: (value: string) => void): HTMLElement {
  const section = document.createElement("div");
  section.className = "templates-section";

  const label = document.createElement("label");
  label.textContent = "Examples";
  section.appendChild(label);

  const row = document.createElement("div");
  row.className = "templates-row";

  for (const t of TEMPLATES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "template-btn";
    btn.textContent = t.name;
    btn.title = t.value;
    btn.addEventListener("click", () => onSelect(t.value));
    row.appendChild(btn);
  }

  section.appendChild(row);
  return section;
}
