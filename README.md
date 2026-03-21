# claw-on-claude

[日本語](README_ja.md)

A workspace framework that brings [OpenClaw](https://github.com/openclaw/openclaw)'s design philosophy to Claude Code.

Persistent **identity, memory, and tools** across sessions.

## Features

- **Persistent identity** — `SOUL.md` / `IDENTITY.md` restore personality each session
- **Two-layer memory** — Daily logs (append-only) + curated long-term memory
- **Browser automation** — Playwright-based MCP server for web interaction
- **Cron jobs** — Scheduled tasks like daily memory consolidation

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | latest | Runtime |
| Node.js | v18+ | Browser MCP server |
| [uv](https://docs.astral.sh/uv/) | latest | Script execution (manages Python automatically) |
| Google Chrome / Chromium | latest | Browser automation |

## Setup

```bash
# 1. Clone
git clone https://github.com/kikuriyou/claw-on-claude.git
cd claw-on-claude

# 2. Run setup
./setup.sh

# 3. Launch Claude Code
claude
```

On first launch, `.claw/USER.md` and `.claw/MEMORY.md` are created automatically.

## Configuration

### Browser

Controlled via `env` in `.mcp.json`:

| Variable | Default | Description |
|----------|---------|-------------|
| `BROWSER_HEADLESS` | `"true"` | Set `"false"` to show browser window (requires display) |
| `DISPLAY` | `":0"` | X11 display number (headed mode only) |
| `CHROME_PATH` | auto-detected | Override Chrome path if needed (auto-detects macOS/Linux) |

## Directory Structure

```
.
├── CLAUDE.md                        # Workspace instructions
├── .mcp.json                        # MCP server config
└── .claw/
    ├── SOUL.md                      # Personality definition
    ├── IDENTITY.md                  # Identity (name, emoji, etc.)
    ├── HEARTBEAT.md                 # Cron job definitions
    ├── USER.md                      # User info (auto-generated, git-ignored)
    ├── MEMORY.md                    # Long-term memory (auto-generated, git-ignored)
    ├── memory/                      # Daily logs (auto-generated, git-ignored)
    ├── scripts/
    │   └── extract-conversation.py  # Conversation log extractor
    └── tools/
        └── browser/                 # Browser MCP server
            ├── src/                 # TypeScript source
            └── package.json
```

## Cron Jobs

Cron jobs defined in `HEARTBEAT.md` are **session-only** — they expire when the session ends. They are automatically re-registered on each new session (per CLAUDE.md instructions).

## Remote Access

Use [Remote Control](https://code.claude.com/docs/en/remote-control) to connect to a running session from your phone or browser.

```bash
# Option 1: Dedicated Remote Control server
claude remote-control --name "claw"

# Option 2: Normal session with Remote Control
claude --remote-control

# Option 3: Enable from within a running session
/remote-control
```

Connect via the displayed URL or QR code at [claude.ai/code](https://claude.ai/code). Requires a Claude.ai subscription (Pro/Max/Team/Enterprise) with OAuth authentication.

## Customization

- `SOUL.md` — Change AI personality and principles
- `IDENTITY.md` — Change name, emoji
- `CLAUDE.md` — Change workspace rules
- `HEARTBEAT.md` — Add or modify cron jobs

## License

[MIT](LICENSE)
