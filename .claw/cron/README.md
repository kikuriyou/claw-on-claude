# .claw/cron - 定期実行ジョブ

crontab + `claude -p` による定期実行の仕組み。

## セットアップ

```bash
# 初回セットアップ（.env作成 + crontab登録）
bash setup.sh

# crontabのみ再登録
bash .claw/cron/install.sh

# crontab登録を解除
bash .claw/cron/install.sh --uninstall
```

### 前提条件

- `claude` CLI がインストール済み
- `.env` に `ANTHROPIC_API_KEY` が設定済み
- macOS: Full Disk Access に `/usr/sbin/cron` を追加（GUIでの操作が必要）
  1. System Settings → Privacy & Security → Full Disk Access
  2. `+` ボタン → Finder で `Cmd+Shift+G` → `/usr/sbin/cron` に移動して追加

## ジョブの追加方法

1. `.claw/cron/scripts/` にスクリプトを作成
2. `jobs.conf` にスケジュールを追加
3. `bash .claw/cron/install.sh` で登録

### jobs.conf の書式

```
# schedule | script
5 0 * * * | scripts/save-history.sh
```

- `|` 区切りでcronスケジュールとスクリプトパスを分離
- スクリプトパスは `.claw/cron/` からの相対パス
- `#` 始まりはコメント

### スクリプトテンプレート

```bash
#!/usr/bin/env bash
set -e
source "$(dirname "$0")/_common.sh"

# _common.sh が提供するもの:
#   $PROJECT_DIR  - プロジェクトルート
#   $CLAUDE_BIN   - claude CLIのフルパス
#   $LOG_FILE     - 日付別ログファイル
#   .env の環境変数（ANTHROPIC_API_KEY等）
#   stdout/stderr は自動的にログファイルにリダイレクト

"$CLAUDE_BIN" -p "プロンプト" \
  --model claude-sonnet-4-6 \
  --max-turns 5 \
  --allowedTools "Read Write Edit Glob Grep"

# Gmail/Calendar が必要な場合は --chrome を追加
# "$CLAUDE_BIN" -p "プロンプト" --chrome --model claude-sonnet-4-6
```

## トラブルシューティング

### ログの確認

```bash
# 今日のログ
cat .claw/cron/logs/$(date +%Y-%m-%d).log

# ログ一覧
ls -lt .claw/cron/logs/
```

### crontab登録の確認

```bash
crontab -l
```

### よくある問題

| 症状 | 原因 | 対処 |
|---|---|---|
| Operation not permitted | macOSのセキュリティ制限 | Full Disk Access に `/usr/sbin/cron` を追加 |
| claude: not found | cron環境のPATH問題 | `_common.sh` のPATH設定を確認 |
| 認証エラー | API Keyが未設定 | `.env` に `ANTHROPIC_API_KEY` を設定 |
| ログが出ない | スクリプトが実行されていない | `mail` コマンドでcronのエラーメールを確認 |
