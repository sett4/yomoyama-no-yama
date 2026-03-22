# Cloudflare Pages

Cloudflare Pages では frontend package 単体ではなく、リポジトリ root を build 起点にします。

workspace は root script の実行順制御に使い、shared package の依存指定自体は npm 互換性のため `file:../yomo-yama-db` を使います。

## Pages Settings

- `root directory`: `/`
- `build command`: `npm run pages:build`
- `build output directory`: `packages/yomo-yama-frontend/_site`

## Required Environment Variables

- `DATABASE_URL`
- `DATABASE_AUTH_TOKEN`

`.env` はローカル開発用です。Pages 本番 build では Cloudflare Pages 側の環境変数を使います。

## Local Verification

```bash
npm install
npm run pages:build
```
