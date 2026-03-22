# `yomo-yama-server`

山岳事故データを収集して libSQL(Turso) に保存する Express サーバーです。

## Environment Variables

- `DATABASE_URL`: `file:./local.db` または Turso/libSQL URL
- `DATABASE_AUTH_TOKEN`: Turso 接続時のみ必須
- `OPENAI_API_KEY`: 追加タグ抽出で利用
