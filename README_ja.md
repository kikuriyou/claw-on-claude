# claw-on-claude

[English](README.md)

[OpenClaw](https://github.com/openclaw/openclaw) の設計思想を Claude Code 上で再現するワークスペースフレームワーク。

セッションをまたいで**人格・記憶・ツール**を持ち越すAIアシスタント環境を構築します。

## 特徴

- **人格の永続化** — `SOUL.md` / `IDENTITY.md` でセッションごとにアイデンティティを復元
- **2層メモリ** — 日次ログ（append-only）+ 長期記憶の自動整理
- **Cronジョブ** — 日次メモリ整理などのスケジュールタスク

## 前提条件

| ツール | バージョン | 用途 |
|--------|-----------|------|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | 最新 | 実行基盤 |
| [uv](https://docs.astral.sh/uv/) | 最新 | スクリプト実行（Python自動管理） |

## セットアップ

```bash
# 1. クローン
git clone https://github.com/kikuriyou/claw-on-claude.git
cd claw-on-claude

# 2. セットアップ実行
./setup.sh

# 3. Claude Code を起動
claude
```

初回起動時に `.claw/USER.md` と `.claw/MEMORY.md` が自動作成されます。

## 環境設定

## ブラウザ操作

`claude --chrome` でログイン済みのChromeブラウザを操作できます。[Claude in Chrome](https://chromewebstore.google.com/detail/claude-in-chrome/fcoeoabgfenejglbffodgkkbkcdhcgfn) 拡張機能が必要です。

```bash
# Chrome連携で起動
claude --chrome
```

詳しくは `CLAUDE.md` のブラウザセクションを参照してください。

## ディレクトリ構成

```
.
├── CLAUDE.md                        # ワークスペース指示書
├── .mcp.json                        # MCP サーバー設定
└── .claw/
    ├── SOUL.md                      # 人格定義
    ├── IDENTITY.md                  # アイデンティティ（名前・絵文字等）
    ├── HEARTBEAT.md                 # Cronジョブ定義
    ├── USER.md                      # ユーザー情報（自動生成・git除外）
    ├── MEMORY.md                    # 長期記憶（自動生成・git除外）
    ├── memory/                      # 日次ログ（自動生成・git除外）
    └── scripts/
        └── extract-conversation.py  # 会話ログ抽出
```

## Cronジョブについて

`HEARTBEAT.md` に定義されたCronジョブは **Claude Code のセッション中のみ有効** です。セッション終了時に消えるため、新しいセッションを開始するたびに自動で再登録されます（CLAUDE.md の指示による）。

## Discord連携

ClaudeをDiscordチャンネルに接続できます。セットアップ手順は [Channelsドキュメント](https://code.claude.com/docs/en/channels) を参照してください。

```bash
# Discord + Chrome連携で起動
claude --channels plugin:discord@claude-plugins-official --chrome --dangerously-skip-permissions
```

## リモートアクセス

[Remote Control](https://code.claude.com/docs/en/remote-control) を使うと、実行中のセッションにスマホやブラウザから接続できます。

```bash
# 方法1: Remote Control 専用サーバーとして起動
claude remote-control --name "claw"

# 方法2: 通常セッションにRemote Controlを付与
claude --remote-control

# 方法3: 起動中のセッション内で有効化
/remote-control
```

表示されるURLまたはQRコードから [claude.ai/code](https://claude.ai/code) 経由で接続できます。Claude.ai のサブスクリプション（Pro/Max/Team/Enterprise）と OAuth 認証が必要です。

## カスタマイズ

- `SOUL.md` — AIの性格・方針を変更
- `IDENTITY.md` — 名前・絵文字を変更
- `CLAUDE.md` — ワークスペースのルールを変更
- `HEARTBEAT.md` — Cronジョブの追加・変更

## ライセンス

[MIT](LICENSE)
