#!/usr/bin/env bash
#
# Extract a day's conversation messages from Claude Code session files.
# Delegates to the Python script in .claw/scripts/ for proper timezone handling.
# Usage: extract-conversations.sh [YYYY-MM-DD]

TARGET_DATE="${1:-$(date -v-1d +%Y-%m-%d)}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

exec /opt/homebrew/bin/uv run "$PROJECT_DIR/.claw/scripts/extract-conversation.py" \
  --date "$TARGET_DATE" \
  --project-path "$PROJECT_DIR"
