# HEARTBEAT.md - Scheduled Jobs & Periodic Tasks

## Persistent Cron Jobs (crontab)

Daily memory recording is now handled by crontab, running outside of Claude sessions.
See `.claw/cron/README.md` for details.

- **Schedule:** `5 0 * * *` (毎日 00:05)
- **Script:** `.claw/cron/scripts/save-history.sh`
- **What it does:** 前日の会話履歴を抽出 → サマリを `.claw/memory/YYYY-MM-DD.md` に保存 → 重要事項を `.claw/MEMORY.md` に追記

管理コマンド:
```bash
bash .claw/cron/install.sh            # 登録
bash .claw/cron/install.sh --uninstall # 解除
crontab -l                             # 確認
```

## Session-Only Jobs (CronCreate)

セッション内で一時的に定期実行したい場合は `CronCreate` を使う。
セッション終了で消えるので、永続化が必要なものは上記 crontab 方式を使うこと。
