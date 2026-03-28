#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# .env setup
if [[ ! -f "$SCRIPT_DIR/.env" ]]; then
  echo "Creating .env from .env.example..."
  cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
  echo "Please edit .env and set your ANTHROPIC_API_KEY."
  echo "  vim $SCRIPT_DIR/.env"
fi

# macOS: cron requires Full Disk Access
if [[ "$(uname)" == "Darwin" ]]; then
  echo ""
  echo "⚠️  macOS requires Full Disk Access for cron."
  echo "   System Settings → Privacy & Security → Full Disk Access"
  echo "   Add /usr/sbin/cron (Cmd+Shift+G in Finder to navigate)"
  echo ""
fi

# cron jobs
if [[ -f "$SCRIPT_DIR/.claw/cron/install.sh" ]]; then
  bash "$SCRIPT_DIR/.claw/cron/install.sh"
fi

echo "Setup complete. Run 'claude' to start."
