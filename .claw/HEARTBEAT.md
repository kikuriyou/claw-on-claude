# HEARTBEAT.md - Periodic Jobs & Checks

## CronCreate Jobs (session-only, re-register on startup)

セッション起動時に `CronList` で確認し、未登録なら以下を `CronCreate` で登録する。
CronCreate はセッション終了で消える。起動時に毎回再登録すること。

### Memory Flush (3時間おき)

- **Schedule:** `7 */3 * * *`
- **Prompt:** `Memory Flush: 直近の会話を振り返り、重要な決定・学び・実装内容があれば .claw/memory/YYYY-MM-DD.md（今日の日付）に追記してください。何もなければスキップ。ルール: append-only、簡潔に、重複しない。`

### Daily Summary (毎日 00:05)

- **Schedule:** `5 0 * * *`
- **Prompt:** `Daily Summary: 前日の会話サマリを生成してください。手順: 1) uv run .claw/cron/scripts/extract-conversation.py --date $(date -v-1d +%Y-%m-%d) --project-path . で前日の会話を抽出 2) 抽出した内容を要約して .claw/memory/YYYY-MM-DD.md（前日の日付）に保存 3) 特に重要な決定事項・学びがあれば .claw/MEMORY.md に追記。既にファイルがあれば追記（append-only）。会話がなければスキップ。`

### Morning Briefing (毎朝 05:00)

- **Schedule:** `3 5 * * *`
- **Prompt:** `Morning Briefing: 以下を確認してユーザーに報告してください。1) Gmail: 昨日の未読メール一覧と、重要と思われるものをピックアップ 2) Google Calendar: 今日の予定サマリ 3) Weather: 今日の天気と注意点（東京）。簡潔に箇条書きで。`

### X Timeline Check (毎朝 09:00)

- **Schedule:** `3 9 * * *`
- **Prompt:** `X Timeline Check: ブラウザでX (x.com/home) を開き、ログイン済みタイムライン（For You）の最新投稿を確認してください。重要・面白い内容をサマリとして箇条書きで報告。トレンドも確認。`

## Heartbeat Behavior

heartbeat poll を受け取ったとき、何もなければ `HEARTBEAT_OK` で応答。

**報告すべきとき:**
* 重要メールが来た
* カレンダーイベントが2時間以内に迫っている
* 何か面白い発見があった

**静かにすべきとき:**
* 深夜 (23:00-08:00) — 緊急時以外
* ユーザーが明らかに忙しい
* 前回チェックから変化なし

**Proactive work (確認不要):**
* メモリファイルの整理
* プロジェクト状況確認 (git status等)
* `.claw/MEMORY.md` のレビュー・更新

### Memory Maintenance

数日おきに heartbeat を利用して:
1. 直近の `.claw/memory/YYYY-MM-DD.md` を読む
2. 長期保存すべき重要事項を `.claw/MEMORY.md` に昇格
3. `.claw/MEMORY.md` の古い情報を削除

## 旧方式 (crontab, 無効化済み)

crontab + `claude -p` による定期実行は廃止。参考: `.claw/cron/README.md`
