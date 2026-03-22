# `@sett4/yomo-yama-db`

Drizzle ORM と libSQL(Turso) を使う共有 DB パッケージです。

## Environment Variables

- `DATABASE_URL`: `file:./local.db` 形式または Turso/libSQL URL
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
