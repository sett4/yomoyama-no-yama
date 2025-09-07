# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発環境とコマンド

### ビルドとデプロイメント
- `npm run build` - サイトをビルド（Eleventyビルド + SASS + JSミニファイ）
- `npm run dev` - 開発サーバー起動（SASSビルド + ファイル監視）
- `npm start` - 開発サーバー起動（npm run devのエイリアス）

### コード品質
- `npm run lint` - ESLintによるコードチェック
- `npm run format` - Prettierによる書式チェック
- `npm run lintfix` - ESLintによる自動修正
- `npm run formatfix:js` - Prettierによる自動修正

### その他
- `npm run clean` - ビルド成果物の削除（_siteディレクトリ）
- `npm run prepare` - Prismaクライアント生成

## アーキテクチャ

### 技術スタック
- **Eleventy (11ty)** - 静的サイトジェネレータ
- **Nunjucks** - テンプレートエンジン
- **SASS** - CSSプリプロセッサ
- **Prisma** - データベースORM
- **ESM（ES Modules）** - プロジェクト全体でESMを使用

### ディレクトリ構造

#### `_11ty/` - Eleventyの設定とヘルパー
- モジュール化された設定（コレクション、フィルター、ショートコードなど）
- `collections/` - データコレクション定義
- `filters/` - テンプレートフィルター
- `transforms/` - HTML変換処理
- `shortcodes/` - テンプレートショートコード

#### `content/` - サイトコンテンツ
- `_data/` - グローバルデータ（siteConfig.js, incidents.js等）
- `_includes/` - テンプレートファイル
  - `layouts/` - ページレイアウト
  - `partials/` - 部分テンプレート
- `pages/` - 静的ページ
- `posts/` - ブログ記事
- `utils/` - ユーティリティページ（robots.txt, sitemap等）

#### `src/` - アセットファイル
- `styles/` - SASSファイル

### 設定ファイル

#### `siteConfig.js`
サイト全体の設定を管理：
- サイト情報（タイトル、説明、URL）
- 作者情報
- フィード設定（RSS、JSON、Twtxt）
- PWA設定
- ソーシャルメディア設定

#### `.eleventy.js`
Eleventyのメイン設定ファイル。`_11ty/index.js`から機能をインポートして使用。

### 特殊機能

#### 山岳事故情報システム
- `incidents.js` - 山岳事故データ処理
- `incident/` - 事故情報ページテンプレート
- 月別・年別での事故情報表示
- 専用フィード生成

#### 多言語対応
- 日本語サイト（`language: 'ja'`）
- `phrases.js` - 翻訳可能な文言集

#### フィード生成
- RSS（Atom）フィード
- JSON Feed
- Twtxtフィード

## 開発時の注意事項

### ESMモジュール
- プロジェクト全体でESM（`"type": "module"`）を使用
- `import/export`構文を使用
- `require()`は使用しない

### コード品質
- pre-commitフックでformat + lintが自動実行
- PrettierとESLintによる厳格なコード品質管理

### データ管理
- Prismaを使用したデータベース操作
- `incidents.js`で外部データソースから山岳事故情報を取得・処理

### テンプレート開発
- Nunjucksテンプレートエンジン使用
- 高度にモジュール化されたテンプレート構造
- 部分テンプレートの積極的な再利用