#!/usr/bin/env bash
set -e

CRON_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$CRON_DIR/../.." && pwd)"
TAG="# claw:${PROJECT_DIR##*/}"
CLAUDE_BIN="$(which claude 2>/dev/null || echo "")"

if [[ -z "$CLAUDE_BIN" ]]; then
  echo "ERROR: claude not found in PATH"
  exit 1
fi

# Uninstall mode
if [[ "$1" == "--uninstall" ]]; then
  crontab -l 2>/dev/null | grep -v "$TAG" | crontab -
  echo "Removed all cron jobs for ${PROJECT_DIR##*/}"
  exit 0
fi

# Remove existing entries for this project, then re-register
crontab -l 2>/dev/null | grep -v "$TAG" > /tmp/crontab-clean 2>/dev/null || true
cat /tmp/crontab-clean | crontab -
rm -f /tmp/crontab-clean

count=0
while IFS='|' read -r schedule script; do
  [[ "$schedule" =~ ^[[:space:]]*#.*$ || -z "$schedule" ]] && continue
  schedule=$(echo "$schedule" | xargs)
  script=$(echo "$script" | xargs)
  script_path="$CRON_DIR/$script"

  if [[ ! -f "$script_path" ]]; then
    echo "WARN: $script_path not found, skipping"
    continue
  fi

  chmod +x "$script_path"
  (crontab -l 2>/dev/null; echo "$schedule $script_path $TAG") | crontab -
  count=$((count + 1))
done < "$CRON_DIR/jobs.conf"

echo "Registered $count cron job(s) for ${PROJECT_DIR##*/}"
