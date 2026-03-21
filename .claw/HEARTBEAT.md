# HEARTBEAT.md - Scheduled Jobs & Periodic Tasks

Read this file at session start and register all cron jobs defined here. Jobs are session-only — must be re-registered every session.

## Cron Jobs

### Daily Memory Recording
- **Schedule:** `59 23 * * *`
- **Description:** Organize daily memory and promote important items to long-term memory

**Steps:**
1. Extract conversation history:
   ```
   uv run .claw/scripts/extract-conversation.py --date <today's date>
   ```
2. Compare the output with the existing `.claw/memory/YYYY-MM-DD.md`, then create or append a summary of important events, decisions, and lessons
3. Promote items worth keeping long-term to `.claw/MEMORY.md` (check for duplicates first)
4. Skip if there's nothing to record or update

**Notes:**
- Assumes notes have been accumulated throughout the day via in-conversation writes and Pre-Compaction Memory Flush
- The main role of this job is "organize and promote", not recording from scratch
- Use `.claw/scripts/extract-conversation.py` to extract conversation history
