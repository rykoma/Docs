# 移行前コンテンツ検証

この手順は、記事・固定ページを追加または更新したときに管理者が実行します。

## 検証コマンド

依存関係を復元してから、リポジトリのルートで次を実行します。

```powershell
npm ci
npm run validate
```

`npm run validate:front-matter` は Front Matter だけを検証し、`npm run validate:links` は Markdown の内部リンクと画像参照を検証します。`npm test` は検証スクリプトの回帰テストを実行します。

## 対象ディレクトリ

- 記事: `source/_posts/ja/`、`source/_posts/en/`
- 固定ページ: `source/ja/`、`source/en/`

対象ファイルは `.md` と `.markdown` です。Front Matter の `lang` は、配置先のディレクトリと一致させます。

## エラーの扱い

検証違反はファイルごとに一覧表示され、コマンドは非ゼロ終了します。違反を修正するまで `hexo generate` を実行しません。GitHub Actions でも同じ検証を build より前に実行します。

## URL 環境の確認

通常のプロジェクトサイト用 build:

```powershell
npx hexo generate --config _config.yml,_config.github-pages.yml --url https://rykoma.github.io/Docs --root /Docs/
```

独自ドメイン用 build:

```powershell
npx hexo generate --config _config.yml --url https://blog.rykoma.net --root /
```

本格移行前は、既存の `hello-world` ja/en 記事とテスト内の固定ページ用フィクスチャで検証します。代表コンテンツの移行確認は別途実施します。
