# HEARTBEAT.md - Scheduled Jobs & Periodic Tasks

セッション開始時にこのファイルを読み、すべてのCronジョブを登録すること。

## Cron Jobs

### Daily Memory Recording
- **Schedule:** `59 23 * * *`
- **Description:** 日次メモリの整理と長期メモリへの昇格

**手順:**
1. 会話履歴を取得する:
   ```
   uv run .claw/scripts/extract-conversation.py --date <今日の日付>
   ```
2. 出力内容と、既存の `.claw/memory/YYYY-MM-DD.md` を照合し、重要な出来事・決定・学びをサマリーにして `.claw/memory/YYYY-MM-DD.md` に作成or追記
3. 日次メモから今後も役立つ重要事項を `.claw/MEMORY.md` に追記・更新（既存内容との重複確認をしてから）
4. 特に記録・更新すべきことがなければスキップ

**補足:**
- 会話中の都度書き込みや Pre-Compaction Memory Flush で既にメモが蓄積されている前提
- このジョブの主な役割は「整理と昇格」であり、ゼロからの記録ではない
- 会話履歴の取得には `.claw/scripts/extract-conversation.py` を使用する
