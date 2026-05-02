# Astro 版 frontend 再構築計画

## Summary

- `packages/yomo-yama-frontend` に Astro の静的サイトとして再構築する。
- React/Preact/Vue/Svelte などの renderer は入れず、Astro コンポーネント、Markdown、ビルド時 TypeScript/JavaScript、通常のクライアント JS だけで実装する。
- 既存 Eleventy と URL 互換を優先し、Astro 版を正式な `packages/yomo-yama-frontend` とする。

## Key Changes

- workspace `yomo-yama-frontend` を Astro に置き換え、依存は `astro`, `sass`, `@astrojs/rss`, `@astrojs/sitemap`, `@sett4/yomo-yama-db` に絞る。
- `src/lib/incidents.ts` に DB 取得キャッシュを置き、`findPublishedPostsByCategory(db, "incident")` をビルド中 1 回だけ呼ぶ。
- 既存 Eleventy の layout/partials/filter/shortcode 相当を Astro components と純関数に移す。
- 静的 asset は `public/` に配置し、`/images/...`, `/fonts/...`, `/favicon.ico`, `/_headers` の URL を維持する。
- `/incident/{slug}.html`, `/incident/{YYYY-MM}.html`, `/incident/tags/{tag}.html`, `/incident/mountain/{tag}.html` を静的生成する。
- `/manifest.json`, `/robots.txt`, `/incident/feed-mountain-incident.xml`, `/sitemap.xml` を Astro endpoint/integration で生成する。

## Test Plan

- `npm run build:db`
- `DATABASE_URL="file:${PWD}/packages/yomo-yama-db/local.db" npm run build --workspace yomo-yama-frontend`
- `npm run check --workspace yomo-yama-frontend`
- 主要 URL と生成件数を現行 Eleventy 出力と比較する。
- dev server で theme switcher, hamburger, scroll-to-top, pagination jump, clipboard share を確認する。

## Assumptions

- 初回移行ではデザイン刷新や Sass module 化は行わない。
- Cloudflare Pages の本番出力先切替は別作業にする。
- 現行 Eleventy build 実測は約 231 秒、出力は 15,695 ファイル、208MB。
