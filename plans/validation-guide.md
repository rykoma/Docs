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

代表サンプルとして `create-draft-meeting-with-microsoft-graph` (画像付き記事)、`microsoft-graph-email-attachments` (画像なし記事)、`about` (固定ページ) の ja/en ペアを移行し、トップページ、記事・固定ページ、言語切り替え、画像、内部リンク、外部リンクを確認します。

## 記事の公開日・更新日の確認

`node --test tests/article-dates.test.js` で日付表示の回帰テストを実行します。両方の URL 環境で、次を確認します。

- 日英の記事の個別ページで、公開日がカード外に表示され、`updated` と `date` の日時が異なる場合だけ、タイトル下に「更新日」/「Updated」が表示されること。
- 同じ日時 (タイムゾーン表記だけが異なる同一の瞬間を含む) では更新日が表示されず、同日内の時刻差では表示されること。日付の表示は `YYYY-MM-DD` のため、同日更新では両方が同じ日付になること。
- ホーム、アーカイブ、カテゴリー、タグなどの記事一覧では従来の日付表示が維持され、固定ページには公開日も更新日も表示されないこと。
- 狭い画面でも更新日が記事カード内に収まり、タイトルや本文と重ならないこと。
- 更新日が本文より控えめな文字サイズで表示され、更新日欄に下線や区切り線が付かないこと。
- 更新日が記事ヘッダー内の右端に時計アイコン付きで表示され、本文の左揃えと視覚的に区別されること。

Stylus の変更が生成結果に反映されない場合は、`npm run clean` を実行してから再生成します。
