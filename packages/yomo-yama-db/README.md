# `@sett4/yomo-yama-db`

Drizzle ORM と libSQL(Turso) を使う共有 DB パッケージです。

## Monorepo Build

Cloudflare Pages では `packages/yomo-yama-frontend` を root directory にせず、repo root を root directory に設定します。

shared package の依存指定は npm 互換性のため `workspace:*` ではなく `file:../yomo-yama-db` を使います。

- `root directory`: `/`
- `build command`: `npm run pages:build`
- `build output directory`: `packages/yomo-yama-frontend/dist`

ローカルでも monorepo 全体で install する前提です。

```bash
npm install
npm run build:db
npm run build:frontend
```

## Environment Variables

- `DATABASE_URL`: repo root から `file:${PWD}/packages/yomo-yama-db/local.db` 形式で指定する、または Turso/libSQL URL。ローカル file DB は cwd に依存しない絶対パスを指定する。
- `DATABASE_AUTH_TOKEN`: Turso 接続時のみ必須

## Commands

```bash
npm run db:migrate
npm run db:seed
```

## CockroachDB から libSQL への移行手順

1. CockroachDB から `Category`, `Post`, `PostExtra` をエクスポートする
2. libSQL 側で `npm run db:migrate` を実行する
3. `Category`
4. `Post`
5. `PostExtra`

CockroachDB からの例:

```sql
COPY (SELECT * FROM "Category") TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM "Post") TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM "PostExtra") TO STDOUT WITH CSV HEADER;
```
