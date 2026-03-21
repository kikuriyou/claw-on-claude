import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  getActivePage,
  getAllPages,
  createNewPage,
  closePage,
  setActivePageIndex,
  cleanup,
} from './browser-session.js';
import { generateSnapshot, resolveRef } from './element-refs.js';

const server = new McpServer({
  name: 'claw-on-claude-browser',
  version: '0.1.0',
});

// --- browser_navigate ---
server.tool(
  'browser_navigate',
  'Navigate to a URL. Returns page title and screenshot.',
  { url: z.string().describe('The URL to navigate to') },
  async ({ url }) => {
    const page = await getActivePage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const title = await page.title();
    const screenshot = await page.screenshot({ type: 'png' });

    return {
      content: [
        { type: 'text' as const, text: `Navigated to: ${page.url()}\nTitle: ${title}` },
        { type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const },
      ],
    };
  }
);

// --- browser_screenshot ---
server.tool(
  'browser_screenshot',
  'Take a screenshot of the current page.',
  { fullPage: z.boolean().optional().describe('Capture full scrollable page') },
  async ({ fullPage }) => {
    const page = await getActivePage();
    const screenshot = await page.screenshot({ type: 'png', fullPage: fullPage ?? false });

    return {
      content: [
        { type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const },
      ],
    };
  }
);

// --- browser_click ---
server.tool(
  'browser_click',
  'Click an element by ref (e.g. "e3") or CSS selector. Run browser_snapshot first to get refs.',
  { ref: z.string().describe('Element ref (e1, e2...) or CSS selector') },
  async ({ ref }) => {
    const page = await getActivePage();
    const locator = resolveRef(ref, page);
    await locator.click({ timeout: 10000 });

    // Brief wait for page to settle
    await page.waitForTimeout(500);
    const title = await page.title();

    return {
      content: [
        { type: 'text' as const, text: `Clicked "${ref}" — Page: ${page.url()} | Title: ${title}` },
      ],
    };
  }
);

// --- browser_type ---
server.tool(
  'browser_type',
  'Type text into an element. Use ref from browser_snapshot or CSS selector.',
  {
    ref: z.string().describe('Element ref (e1, e2...) or CSS selector'),
    text: z.string().describe('Text to type'),
    submit: z.boolean().optional().describe('Press Enter after typing'),
  },
  async ({ ref, text, submit }) => {
    const page = await getActivePage();
    const locator = resolveRef(ref, page);
    await locator.fill(text, { timeout: 10000 });

    if (submit) {
      await locator.press('Enter');
      await page.waitForTimeout(500);
    }

    return {
      content: [
        { type: 'text' as const, text: `Typed "${text}" into "${ref}"${submit ? ' and submitted' : ''}` },
      ],
    };
  }
);

// --- browser_snapshot ---
server.tool(
  'browser_snapshot',
  'Get accessibility snapshot of the current page with element refs (e1, e2...) for interaction.',
  {},
  async () => {
    const page = await getActivePage();
    const snapshot = await generateSnapshot(page);

    return {
      content: [{ type: 'text' as const, text: snapshot }],
    };
  }
);

// --- browser_scroll ---
server.tool(
  'browser_scroll',
  'Scroll the page up or down.',
  {
    direction: z.enum(['up', 'down']).describe('Scroll direction'),
    amount: z.number().optional().describe('Scroll amount in pixels (default: 500)'),
  },
  async ({ direction, amount }) => {
    const page = await getActivePage();
    const delta = (amount ?? 500) * (direction === 'up' ? -1 : 1);
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(300);

    return {
      content: [
        { type: 'text' as const, text: `Scrolled ${direction} ${Math.abs(delta)}px` },
      ],
    };
  }
);

// --- browser_evaluate ---
server.tool(
  'browser_evaluate',
  'Execute JavaScript in the browser page and return the result.',
  { script: z.string().describe('JavaScript code to execute') },
  async ({ script }) => {
    const page = await getActivePage();
    const result = await page.evaluate(script);
    const output = JSON.stringify(result, null, 2) ?? 'undefined';
    const truncated = output.length > 10000 ? output.slice(0, 10000) + '\n...(truncated)' : output;

    return {
      content: [{ type: 'text' as const, text: truncated }],
    };
  }
);

// --- browser_tab_list ---
server.tool(
  'browser_tab_list',
  'List all open browser tabs.',
  {},
  async () => {
    const pages = await getAllPages();
    if (pages.length === 0) {
      return { content: [{ type: 'text' as const, text: 'No tabs open.' }] };
    }

    const lines = await Promise.all(
      pages.map(async (p, i) => {
        const title = await p.title();
        const marker = i === (await import('./browser-session.js')).getActivePageIndex() ? ' (active)' : '';
        return `[${i}]${marker} ${p.url()} — ${title}`;
      })
    );

    return {
      content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
  }
);

// --- browser_tab_new ---
server.tool(
  'browser_tab_new',
  'Open a new browser tab, optionally navigating to a URL.',
  { url: z.string().optional().describe('URL to open in new tab') },
  async ({ url }) => {
    const { index } = await createNewPage(url);

    return {
      content: [
        { type: 'text' as const, text: `Opened new tab [${index}]${url ? ` at ${url}` : ''}` },
      ],
    };
  }
);

// --- browser_tab_close ---
server.tool(
  'browser_tab_close',
  'Close a browser tab by index.',
  { index: z.number().describe('Tab index to close') },
  async ({ index }) => {
    await closePage(index);

    return {
      content: [{ type: 'text' as const, text: `Closed tab [${index}]` }],
    };
  }
);

// --- Start server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('claw-on-claude-browser MCP server running on stdio');
}

main().catch(async (err) => {
  console.error('Failed to start server:', err);
  await cleanup();
  process.exit(1);
});
