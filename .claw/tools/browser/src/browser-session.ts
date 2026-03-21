import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let activePageIndex = 0;

function getChromePath(): string {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }
  return '/usr/bin/google-chrome';
}
const CHROME_PATH = getChromePath();
const VIEWPORT = { width: 1280, height: 720 };
const HEADLESS = process.env.BROWSER_HEADLESS !== 'false';

const CDP_URL = process.env.CDP_URL ?? 'http://localhost:9222';

export async function ensureBrowser(): Promise<Browser> {
  if (browser && browser.isConnected()) return browser;

  // Try CDP connection first (user's running Chrome)
  try {
    browser = await chromium.connectOverCDP(CDP_URL);
    console.error(`[browser] Connected to existing Chrome via CDP (${CDP_URL})`);
  } catch {
    // Fall back to launching a new browser instance
    console.error('[browser] CDP connection failed, launching new Chrome instance');
    browser = await chromium.launch({
      executablePath: CHROME_PATH,
      headless: HEADLESS,
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
      ],
    });
  }

  browser.on('disconnected', () => {
    browser = null;
    context = null;
  });

  return browser;
}

export async function ensureContext(): Promise<BrowserContext> {
  if (context) return context;

  const b = await ensureBrowser();
  // CDP接続時は既存コンテキストを使う（新規作成するとセッションが切れる）
  const contexts = b.contexts();
  context = contexts.length > 0 ? contexts[0] : await b.newContext({ viewport: VIEWPORT });
  return context;
}

export async function getActivePage(): Promise<Page> {
  const ctx = await ensureContext();
  const pages = ctx.pages();

  if (pages.length === 0) {
    const page = await ctx.newPage();
    activePageIndex = 0;
    return page;
  }

  if (activePageIndex >= pages.length) {
    activePageIndex = pages.length - 1;
  }

  return pages[activePageIndex];
}

export function getActivePageIndex(): number {
  return activePageIndex;
}

export function setActivePageIndex(index: number): void {
  activePageIndex = index;
}

export async function getAllPages(): Promise<Page[]> {
  const ctx = await ensureContext();
  return ctx.pages();
}

export async function createNewPage(url?: string): Promise<{ page: Page; index: number }> {
  const ctx = await ensureContext();
  const page = await ctx.newPage();
  const pages = ctx.pages();
  const index = pages.indexOf(page);
  activePageIndex = index;

  if (url) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  }

  return { page, index };
}

export async function closePage(index: number): Promise<void> {
  const ctx = await ensureContext();
  const pages = ctx.pages();

  if (index < 0 || index >= pages.length) {
    throw new Error(`Tab index ${index} out of range (0-${pages.length - 1})`);
  }

  await pages[index].close();

  if (activePageIndex >= ctx.pages().length) {
    activePageIndex = Math.max(0, ctx.pages().length - 1);
  }
}

export async function cleanup(): Promise<void> {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
    context = null;
  }
}

process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});
