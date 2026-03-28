#!/usr/bin/env bash
set -e
source "$(dirname "$0")/_common.sh"

YESTERDAY="$(date -v-1d +%Y-%m-%d)"
MEMORY_DIR="$PROJECT_DIR/.claw/memory"
MEMORY_FILE="$MEMORY_DIR/$YESTERDAY.md"
LONG_TERM_MEMORY="$PROJECT_DIR/.claw/MEMORY.md"

mkdir -p "$MEMORY_DIR"

# Extract yesterday's conversations
CONVERSATIONS="$(bash "$SCRIPT_DIR/extract-conversations.sh" "$YESTERDAY")"

if [[ -z "$CONVERSATIONS" ]]; then
  echo "No conversations found for $YESTERDAY. Skipping."
  exit 0
fi

# Build prompt with conversation data
PROMPT="$(cat <<EOF
以下は ${YESTERDAY} の会話履歴です。これを元に2つの作業を行ってください。

## 作業1: デイリーサマリ
会話の内容を要約して、以下のファイルに保存してください: ${MEMORY_FILE}
フォーマット:
- 見出し: # ${YESTERDAY}
- 何を話したか、何を決めたか、何を実装したかを箇条書きで簡潔に
- 既にファイルが存在する場合は、既存の内容を残して追記

## 作業2: 長期メモリ更新
特に重要な決定事項、学んだこと、今後に影響する情報があれば、以下のファイルに追記してください: ${LONG_TERM_MEMORY}
- 重複しないように既存の内容を確認してから追記
- 重要事項がなければスキップ

## 会話履歴
${CONVERSATIONS}
EOF
)"

"$CLAUDE_BIN" -p "$PROMPT" \
  --model claude-sonnet-4-6 \
  --max-turns 10 \
  --allowedTools "Read Write Edit Glob Grep"

echo "=== save-history completed for $YESTERDAY ==="
