#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# ///
"""Extract user/assistant messages from Claude Code conversation logs.

Usage:
    uv run .claw/scripts/extract-conversation.py [--date YYYY-MM-DD] [--project-path PATH]

Reads JSONL conversation logs from ~/.claude/projects/ and extracts
user and assistant text messages, filtering by date.

Options:
    --date          Target date (default: today in local timezone)
    --project-path  Workspace path (default: current working directory)
    --max-chars     Max total characters to output (default: 50000)
"""

import json
import sys
import os
import glob
from datetime import datetime, timezone, timedelta
from pathlib import Path
import argparse


def get_local_date_range(date_str: str) -> tuple[str, str]:
    """Return UTC start/end timestamps for a local date."""
    # Detect local UTC offset
    now = datetime.now()
    utc_now = datetime.now(timezone.utc)
    offset_hours = round((now - utc_now.replace(tzinfo=None)).total_seconds() / 3600)

    target = datetime.strptime(date_str, "%Y-%m-%d")
    start = target - timedelta(hours=offset_hours)
    end = start + timedelta(days=1)
    return start.strftime("%Y-%m-%dT%H:%M:%S"), end.strftime("%Y-%m-%dT%H:%M:%S")


def workspace_to_project_dir(workspace_path: str) -> str:
    """Convert workspace path to Claude Code project directory name."""
    # ~/.claude/projects/-home-user-path-to-workspace
    resolved = str(Path(workspace_path).resolve())
    dir_name = resolved.replace("/", "-")
    if dir_name.startswith("-"):
        pass  # keep leading dash
    return os.path.expanduser(f"~/.claude/projects/{dir_name}")


def extract_text(content) -> str | None:
    """Extract plain text from message content (string or content blocks)."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        texts = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                texts.append(block["text"])
        return "\n".join(texts) if texts else None
    return None


def main():
    parser = argparse.ArgumentParser(description="Extract conversation from Claude Code logs")
    parser.add_argument("--date", default=datetime.now().strftime("%Y-%m-%d"),
                        help="Target date YYYY-MM-DD (default: today)")
    parser.add_argument("--project-path", default=os.getcwd(),
                        help="Workspace path (default: cwd)")
    parser.add_argument("--max-chars", type=int, default=50000,
                        help="Max total output characters (default: 50000)")
    args = parser.parse_args()

    project_dir = workspace_to_project_dir(args.project_path)
    if not os.path.isdir(project_dir):
        print(f"Error: project directory not found: {project_dir}", file=sys.stderr)
        sys.exit(1)

    date_start, date_end = get_local_date_range(args.date)
    jsonl_files = glob.glob(os.path.join(project_dir, "*.jsonl"))

    messages = []
    for filepath in jsonl_files:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue

                msg_type = entry.get("type")
                if msg_type not in ("user", "assistant"):
                    continue

                timestamp = entry.get("timestamp", "")
                if not (date_start <= timestamp < date_end):
                    continue

                message = entry.get("message", {})
                content = message.get("content")
                if content is None:
                    continue

                text = extract_text(content)
                if not text or len(text.strip()) == 0:
                    continue

                # Skip tool results and meta messages
                if entry.get("isMeta"):
                    continue
                if isinstance(content, list) and all(
                    b.get("type") in ("tool_use", "tool_result") for b in content if isinstance(b, dict)
                ):
                    continue

                role = message.get("role", msg_type)
                messages.append((timestamp, role, text))

    messages.sort(key=lambda x: x[0])

    total_chars = 0
    for timestamp, role, text in messages:
        time_short = timestamp[11:16] if len(timestamp) > 16 else timestamp
        prefix = f"[{time_short}] {'Human' if role == 'user' else 'Assistant'}: "
        entry = prefix + text.strip() + "\n\n"

        if total_chars + len(entry) > args.max_chars:
            print(f"\n... (truncated at {args.max_chars} chars)")
            break
        print(entry, end="")
        total_chars += len(entry)

    if not messages:
        print(f"No conversation found for {args.date}", file=sys.stderr)


if __name__ == "__main__":
    main()
