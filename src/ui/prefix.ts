/**
 * Prefix input section – separate field for configuring prefix.
 * Includes button to insert {prefix} placeholder into message.
 */

export function createPrefixSection(
  initialValue: string,
  onChange: (value: string) => void,
  messageTextarea: HTMLTextAreaElement
): HTMLElement {
  const section = document.createElement("div");
  section.className = "prefix-section";

  const label = document.createElement("label");
  label.textContent = "Prefix (optional)";
  section.appendChild(label);

  const hint = document.createElement("span");
  hint.className = "prefix-hint";
  hint.textContent = "Define a prefix that will replace {prefix} in your message";
  section.appendChild(hint);

  const inputRow = document.createElement("div");
  inputRow.className = "prefix-input-row";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "prefix-input";
  input.value = initialValue;
  input.placeholder = "<gold>[HyLib] <gray>";
  input.addEventListener("input", () => onChange(input.value));
  inputRow.appendChild(input);

  const insertBtn = document.createElement("button");
  insertBtn.type = "button";
  insertBtn.className = "prefix-insert-btn";
  insertBtn.textContent = "Insert {prefix}";
  insertBtn.title = "Insert {prefix} placeholder at cursor position";
  insertBtn.addEventListener("click", () => {
    const start = messageTextarea.selectionStart;
    const end = messageTextarea.selectionEnd;
    const text = messageTextarea.value;
    const selected = text.slice(start, end);
    const newText = text.slice(0, start) + "{prefix}" + selected + text.slice(end);
    messageTextarea.value = newText;
    messageTextarea.focus();
    const newPos = start + "{prefix}".length;
    messageTextarea.setSelectionRange(newPos, newPos);
    messageTextarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
  inputRow.appendChild(insertBtn);

  section.appendChild(inputRow);

  return section;
}
