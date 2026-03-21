#!/usr/bin/env bash
set -e

BROWSER_DIR="$(cd "$(dirname "$0")/.claw/tools/browser" && pwd)"

echo "==> Installing dependencies..."
cd "$BROWSER_DIR"
npm install

echo "==> Installing Playwright Chromium..."
npx playwright install chromium

echo "==> Building browser MCP server..."
npm run build

echo ""
echo "Setup complete. Run 'claude' to start."
