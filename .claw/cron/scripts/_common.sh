#!/usr/bin/env bash

# Ensure PATH includes common locations (cron has minimal PATH: /usr/bin:/bin)
export PATH="/usr/local/bin:$HOME/.local/bin:$HOME/.npm-global/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRON_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_DIR="$(cd "$CRON_DIR/../.." && pwd)"
LOG_DIR="$CRON_DIR/logs"

mkdir -p "$LOG_DIR"

# Load .env
if [[ -f "$PROJECT_DIR/.env" ]]; then
  set -a
  source "$PROJECT_DIR/.env"
  set +a
fi

# Resolve claude binary
CLAUDE_BIN="$(which claude 2>/dev/null || echo "")"
if [[ -z "$CLAUDE_BIN" ]]; then
  echo "ERROR: claude not found in PATH" >&2
  exit 1
fi

# Log file (date-based)
TODAY="$(date +%Y-%m-%d)"
LOG_FILE="$LOG_DIR/$TODAY.log"

# Redirect stdout/stderr to log
exec >> "$LOG_FILE" 2>&1
echo "=== $(date '+%Y-%m-%d %H:%M:%S') - $(basename "$0") ==="

# Clean up old logs (older than 7 days)
find "$LOG_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null || true
