# claw-on-claude

[日本語](README_ja.md)

A workspace framework that brings [OpenClaw](https://github.com/openclaw/openclaw)'s design philosophy to Claude Code.

Persistent **identity, memory, and tools** across sessions.

## Features

- **Persistent identity** — `SOUL.md` / `IDENTITY.md` restore personality each session
- **Two-layer memory** — Daily logs (append-only) + curated long-term memory
- **Cron jobs** — Scheduled tasks like daily memory consolidation

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | latest | Runtime |
| [uv](https://docs.astral.sh/uv/) | latest | Script execution (manages Python automatically) |

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

## Browser Automation

Use `claude --chrome` to operate your logged-in Chrome browser. Requires the [Claude in Chrome](https://chromewebstore.google.com/detail/claude-in-chrome/fcoeoabgfenejglbffodgkkbkcdhcgfn) extension.

```bash
# Launch with Chrome integration
claude --chrome
```

See `CLAUDE.md` for browser usage guidelines.

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
    └── scripts/
        └── extract-conversation.py  # Conversation log extractor
```

## Cron Jobs

Cron jobs defined in `HEARTBEAT.md` are **session-only** — they expire when the session ends. They are automatically re-registered on each new session (per CLAUDE.md instructions).

## Discord Integration

Connect Claude to Discord as a channel. See [Channels documentation](https://code.claude.com/docs/en/channels) for setup instructions.

```bash
# Launch with Discord + Chrome integration
claude --channels plugin:discord@claude-plugins-official --chrome --dangerously-skip-permissions
```

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
