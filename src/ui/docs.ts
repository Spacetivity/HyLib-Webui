/**
 * Collapsible docs section with supported tags.
 */

export function createDocsSection(): HTMLElement {
  const section = document.createElement("div");
  section.className = "docs-section";

  const toggle = document.createElement("button");
  toggle.className = "docs-toggle";
  toggle.type = "button";
  toggle.innerHTML = '<span class="docs-arrow">▶</span> Supported Tags';
  toggle.setAttribute("aria-expanded", "false");

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "docs-content-wrapper";

  const content = document.createElement("div");
  content.className = "docs-content";

  content.innerHTML = `
    <p>Same format as <code>HyMessages.parse()</code> in HyLib.</p>
    <p><strong>Shortcuts:</strong> Ctrl+Enter = Copy, Ctrl+K = Clear</p>
    <table>
      <thead>
        <tr>
          <th>Tag</th>
          <th>Example</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><code>color</code>, <code>c</code>, <code>colour</code></td><td><code>&lt;color:#ff0000&gt;</code> or <code>&lt;red&gt;</code></td></tr>
        <tr><td><code>gradient</code>, <code>grnt</code></td><td><code>&lt;gradient:red:blue&gt;text&lt;/gradient&gt;</code></td></tr>
        <tr><td><code>bold</code>, <code>b</code></td><td><code>&lt;bold&gt;text&lt;/bold&gt;</code></td></tr>
        <tr><td><code>italic</code>, <code>i</code>, <code>em</code></td><td><code>&lt;italic&gt;text&lt;/italic&gt;</code></td></tr>
        <tr><td><code>underline</code>, <code>u</code></td><td><code>&lt;underline&gt;text&lt;/underline&gt;</code></td></tr>
        <tr><td><code>monospace</code>, <code>mono</code></td><td><code>&lt;monospace&gt;text&lt;/monospace&gt;</code></td></tr>
        <tr><td><code>link</code>, <code>url</code></td><td><code>&lt;link:https://...&gt;text&lt;/link&gt;</code></td></tr>
        <tr><td><code>reset</code>, <code>r</code></td><td><code>&lt;reset&gt;</code> – clears all styles</td></tr>
      </tbody>
    </table>
    <p><strong>Named colors:</strong> black, dark_blue, dark_green, dark_aqua, dark_red, dark_purple, gold, gray, dark_gray, blue, green, aqua, red, light_purple, yellow, white</p>
  `;

  toggle.addEventListener("click", () => {
    const expanded = contentWrapper.classList.toggle("expanded");
    toggle.setAttribute("aria-expanded", String(expanded));
    (toggle.querySelector(".docs-arrow") as HTMLElement).textContent = expanded ? "▼" : "▶";
  });

  contentWrapper.appendChild(content);
  section.appendChild(toggle);
  section.appendChild(contentWrapper);
  return section;
}
