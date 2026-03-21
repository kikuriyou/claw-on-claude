import type { Page, Locator } from 'playwright-core';

export interface RefEntry {
  role: string;
  name: string;
  level?: number;
}

const INTERACTIVE_ROLES = new Set([
  'button', 'link', 'textbox', 'checkbox', 'radio',
  'combobox', 'menuitem', 'tab', 'switch', 'slider',
  'spinbutton', 'searchbox', 'option', 'menuitemcheckbox',
  'menuitemradio', 'treeitem',
]);

let currentRefs = new Map<string, RefEntry>();
let refCounter = 0;

/**
 * Parse Playwright's ariaSnapshot YAML-like format and generate eN refs.
 *
 * Example input:
 *   - heading "Welcome" [level=1]
 *   - textbox "Email"
 *   - button "Submit"
 *   - list:
 *     - listitem:
 *       - link "Home"
 */
export async function generateSnapshot(page: Page): Promise<string> {
  const snapshot = await page.locator(':root').ariaSnapshot();

  currentRefs = new Map();
  refCounter = 0;

  const lines = snapshot.split('\n');
  const outputLines: string[] = [];

  for (const line of lines) {
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '';

    // Match patterns like: - role "name" or - role "name" [attrs]
    const match = line.match(/^(\s*)-\s+(\w+)(?:\s+"([^"]*)")?(.*)$/);

    if (!match) {
      // Lines that don't match (empty, etc.) — pass through
      if (line.trim()) outputLines.push(line);
      continue;
    }

    const [, , role, name, rest] = match;

    if (INTERACTIVE_ROLES.has(role)) {
      refCounter++;
      const refId = `e${refCounter}`;
      currentRefs.set(refId, { role, name: name || '' });
      const nameStr = name ? ` "${name}"` : '';
      outputLines.push(`${indent}[${refId}] ${role}${nameStr}${rest}`);
    } else {
      const nameStr = name ? ` "${name}"` : '';
      outputLines.push(`${indent}${role}${nameStr}${rest}`);
    }
  }

  const header = `Page: ${page.url()}\n` +
    `Title: ${await page.title()}\n` +
    `---\n`;

  return header + outputLines.join('\n');
}

/**
 * Resolve an eN ref or CSS selector to a Playwright Locator.
 */
export function resolveRef(ref: string, page: Page): Locator {
  // Check if it's an eN ref
  const refMatch = ref.match(/^e(\d+)$/);
  if (refMatch) {
    const entry = currentRefs.get(ref);
    if (!entry) {
      throw new Error(`Ref "${ref}" not found. Run browser_snapshot first to generate refs.`);
    }

    if (entry.name) {
      return page.getByRole(entry.role as any, { name: entry.name });
    } else {
      return page.getByRole(entry.role as any);
    }
  }

  // Otherwise treat as CSS selector
  return page.locator(ref);
}

export function getCurrentRefs(): Map<string, RefEntry> {
  return currentRefs;
}
