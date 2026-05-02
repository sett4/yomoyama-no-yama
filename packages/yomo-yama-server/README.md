# `yomo-yama-server`

山岳事故データを収集して libSQL(Turso) に保存する Express サーバーです。

## Environment Variables

- `DATABASE_URL`: repo root から `file:${PWD}/packages/yomo-yama-db/local.db` 形式で指定する、または Turso/libSQL URL。ローカル file DB は cwd に依存しない絶対パスを指定する。
- `DATABASE_AUTH_TOKEN`: Turso 接続時のみ必須
- `OPENAI_API_KEY`: 追加タグ抽出で利用
