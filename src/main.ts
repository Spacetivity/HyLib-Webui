/**
 * HyLib Message WebUI – Live preview for HyLib format tags.
 * Uses same format as MessageParserImpl / HyMessages.parse().
 */

import "./style.css";
import { createInputSection } from "./ui/input.js";
import { createPreviewSection } from "./ui/preview.js";
import { createDocsSection } from "./ui/docs.js";
import { createPlaceholdersSection } from "./ui/placeholders.js";
import { createTemplatesSection } from "./ui/templates.js";
import { createValidationSection } from "./ui/validation.js";
import { parsePlaceholderMap, applyPlaceholders } from "./utils/placeholders.js";
import { validate } from "./utils/validator.js";

// Optional: restore from URL hash (#m=...)
function getInitialFromHash(): string {
  const hash = window.location.hash.slice(1);
  if (!hash.startsWith("m=")) return "";
  try {
    return decodeURIComponent(hash.slice(2));
  } catch {
    return "";
  }
}

function updateHash(value: string): void {
  if (!value) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
    return;
  }
  history.replaceState(null, "", `#m=${encodeURIComponent(value)}`);
}

const initial = getInitialFromHash() || "Hello <bold>World</bold>! Try <gradient:red:blue>rainbow</gradient> or <link:https://hytale.com>Hytale</link>.";

const app = document.getElementById("app")!;
app.innerHTML = "";

const headerRow = document.createElement("div");
headerRow.className = "header-row";
const h1 = document.createElement("h1");
h1.textContent = "HyLib Message Preview";

const copyBtn = document.createElement("button");
copyBtn.className = "copy-btn mainBar__cta-btn";
copyBtn.innerHTML = `<span class="mainBar__cta-btn__label">Copy</span>`;

const clearBtn = document.createElement("button");
clearBtn.className = "clear-btn mainBar__cta-btn";
clearBtn.innerHTML = `<span class="mainBar__cta-btn__label">Clear</span>`;

const buttonGroup = document.createElement("div");
buttonGroup.className = "header-row__buttons";
buttonGroup.appendChild(clearBtn);
buttonGroup.appendChild(copyBtn);

headerRow.appendChild(h1);
headerRow.appendChild(buttonGroup);
app.appendChild(headerRow);

const { container: preview, update: updatePreview } = createPreviewSection();
const { container: validationContainer, update: updateValidation } = createValidationSection();

let placeholdersValue = "";

const inputSection = createInputSection(initial, (value) => {
  updateHash(value);
  refreshPreviewAndValidation();
});

const placeholdersSection = createPlaceholdersSection("", (value) => {
  placeholdersValue = value;
  refreshPreviewAndValidation();
});

const templatesSection = createTemplatesSection((value) => {
  const textarea = inputSection.querySelector("textarea") as HTMLTextAreaElement;
  textarea.value = value;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
});

function getSubstitutedText(): string {
  const textarea = inputSection.querySelector("textarea") as HTMLTextAreaElement;
  const raw = textarea?.value ?? "";
  const map = parsePlaceholderMap(placeholdersValue);
  return applyPlaceholders(raw, map);
}

function refreshPreviewAndValidation(): void {
  const substituted = getSubstitutedText();
  try {
    updatePreview(substituted);
  } catch (e) {
    updatePreview("");
    (preview.querySelector(".preview-box") as HTMLElement).textContent =
      `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
  const warnings = validate(substituted);
  updateValidation(warnings);
}

app.appendChild(templatesSection);
app.appendChild(inputSection);
app.appendChild(placeholdersSection);
app.appendChild(preview);
app.appendChild(validationContainer);
app.appendChild(createDocsSection());

// Initial render
refreshPreviewAndValidation();

// Copy button – copies raw tag string (for use in Lang files)
const copyBtnLabel = () => copyBtn.querySelector(".mainBar__cta-btn__label")!;
copyBtn.addEventListener("click", async () => {
  const textarea = inputSection.querySelector("textarea") as HTMLTextAreaElement;
  const text = textarea?.value ?? "";
  try {
    await navigator.clipboard.writeText(text);
    copyBtnLabel().textContent = "Copied!";
    setTimeout(() => { copyBtnLabel().textContent = "Copy"; }, 1500);
  } catch {
    copyBtnLabel().textContent = "Failed";
    setTimeout(() => { copyBtnLabel().textContent = "Copy"; }, 1500);
  }
});

// Clear button
clearBtn.addEventListener("click", () => {
  const textarea = inputSection.querySelector("textarea") as HTMLTextAreaElement;
  textarea.value = "";
  refreshPreviewAndValidation();
  updateHash("");
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === "Enter") {
      e.preventDefault();
      copyBtn.click();
    } else if (e.key === "k") {
      e.preventDefault();
      clearBtn.click();
    }
  }
});
