# WordPress から Hexo へのブログ移行計画

## 文書の位置付け

本書は、個人ブログを WordPress から Hexo + GitHub Pages へ移行するための公式な移行計画書です。移行に関する判断、作業状況、確認結果は本書または本書から参照できる管理資料に記録します。

## プロジェクトの目的

現在のブログは WordPress と Azure App Service で運用しています。これを Hexo で生成する静的サイトへ移行し、GitHub Pages で公開します。

移行後は、次の効果を期待します。

- Markdown と GitHub を中心に記事を管理できる。
- GitHub Actions による再現性のある自動デプロイを実現できる。
- WordPress と Azure App Service の運用、保守、障害対応の負担を減らせる。
- 静的サイトによるシンプルで長期運用しやすい構成にできる。
- 日本語と英語のコンテンツを独立して管理し、言語別 URL を安定して提供できる。
- 既存の検索流入を維持するため、WordPress の URL から新 URL へリダイレクトできる。

移行完了後、動作確認と切り戻し判断が完了した段階で Azure 上の WordPress と関連リソースを停止し、削除します。

## 対象システムと確定方針

| 項目 | 方針 |
| --- | --- |
| リポジトリ | `rykoma/Docs` |
| 静的サイト ジェネレーター | Hexo |
| テーマ | `hexo-theme-landscape` |
| 配信基盤 | GitHub Pages |
| デプロイ先ブランチ | `gh-pages` |
| デプロイ方式 | GitHub Actions |
| 独自ドメイン | `blog.rykoma.net` |
| 現行構成 | WordPress + Azure App Service |
| 記事管理 | Markdown + Git |
| 対応言語 | 日本語、英語 |

## ブログのタイトル

WordPress では日本語のみで運用しており、ブログタイトルは「Developer Messaging 研究所」でした。Hexo + GitHub Pages への移行後は日本語と英語の両方を扱うため、言語ごとにタイトルを次のとおり使い分けます。

| 言語 | ブログタイトル |
| --- | --- |
| 日本語 (`/ja/`) | Developer Messaging 研究所 |
| 英語 (`/en/`) | Developer Messaging Lab |

日本語版は WordPress からのブランド継続性を優先して既存のタイトルを維持し、英語版は英語話者に自然に伝わる表現として「Developer Messaging Lab」を新たに採用します。両者は「Developer Messaging」という核となる概念を共有しつつ、「研究所」を英語の "Lab" に対応させることで、言語ごとに自然な響きを保ちます。

実装は `_config.yml` の `titles` (言語コードごとのタイトル) と `title` (言語が判定できないページ向けの既定値) で管理し、`scripts/multilingual-generator.js` の `site_title` ヘルパーを通じて Landscape テーマ側 (ヘッダー、`<title>` タグ、Open Graph、RSS、フッターの著作権表示) で参照します。ルートの言語選択ページ (`/`) や、記事の言語ペア選択ページ (`/<slug>/`) では両言語のタイトルを併記します。

## URL と多言語の方針

新規 URL は記事 ID や日付を使用せず、英語小文字の kebab-case スラッグを使用します。

- 日本語記事: `/ja/<slug>/`
- 英語記事: `/en/<slug>/`
- 日本語トップ: `/ja/`
- 英語トップ: `/en/`

記事の URL は、`source/_posts/ja/` または `source/_posts/en/` の言語ディレクトリと `_config.yml` の `permalink: :slug/` によって生成します。固定ページは `source/ja/<slug>/index.md` または `source/en/<slug>/index.md` に配置し、同じ URL 構造を生成します。

`https://blog.rykoma.net/` にアクセスした場合は、ブラウザーの言語設定に応じて `/ja/` または `/en/` へリダイレクトします。言語に該当しない場合の既定言語は日本語とします。

言語指定のない記事または固定ページ URL にアクセスした場合も、ブラウザーの言語設定に応じて対応する言語 URL へリダイレクトします。言語選択ページと実際のコンテンツ ページは分けて用意します。

RSS は言語ごとに `/ja/rss.xml` と `/en/rss.xml` を生成し、各 feed の item は同じ言語の記事だけを含めます。feed 内の URL は `config.url` と `root` を反映した絶対 URL とし、独自ドメインと GitHub Pages の両方で確認します。item の説明文には記事の `description` をそのまま使用するため、`description` が未設定の記事があるとビルド エラーになります (`scripts/multilingual-generator.js` の `before_generate` フィルターで検証)。本文抜粋や本文全体を description の代わりに使うことはありません。RSS の item 数は `feed.limit` (既定 20 件、`hexo-generator-feed` の既定値と一致) で上限を設定し、無制限に増え続けないようにします。

RSS 2.0 は仕様上、公開日時 (`pubDate`) だけを持ち、更新日時を表す標準要素を持ちません (更新日時と公開日時を明確に分けて扱えるのは Atom 形式です)。本サイトは RSS のみを提供する方針のため、`pubDate` には記事の `date` (公開日) を使用し、`updated` (更新日) を feed には反映しません。記事を更新しても feed 上で新着として再通知されることはなく、feed は常に公開順の一覧になります。この挙動は意図した仕様であり、追加の実装は不要と判断しました。

RSS の `description` は XML エスケープしたプレーンテキストとして出力し、CDATA によるリッチな HTML 埋め込みは行いません。そのため `description` には常にプレーンテキストのみを記述する運用とし、HTML タグを書かないルールとします。この運用ルールを補助するため、`description` に HTML タグらしき記述 (`<tag ...>` や `</tag>` の形) が含まれていた場合はビルド エラーにする軽量チェックを `scripts/multilingual-generator.js` の `before_generate` フィルターに追加しました。このチェックは正規表現による近似判定であり、完全な HTML 判定ではありません。ジェネリクス表記 (`<T>`) や不等号を使った表現などで誤検知する可能性があるため、誤検知時は表現を調整して回避します。

各 `channel` には `<atom:link rel="self">` を追加し、feed 自身の絶対 URL (`config.url` と `root` を反映) を示します。

`/ja/rss.xml` と `/en/rss.xml` は、W3C Feed Validator (https://validator.w3.org/feed/、Direct Input モードでのローカル生成物の検証) で "Valid RSS feed" と判定されています。Direct Input モードでは feed を取得した実際の URL が存在しないため、`Self reference doesn't match document location` という警告が出ますが、これは検証方法に起因するものであり、実際に公開後の URL から取得して検証すれば発生しません。公開後、あらためて URL 指定モードでの再検証を推奨します。

RSS の description チェックは暫定対応であり、今後は次の項目を含む Front Matter 全体の検証スクリプトを別途整備します。

- 記事: `title`、`date`、`updated`、`lang`、`slug`、`categories`、`tags`、`description` の必須項目チェック
- 固定ページ: `title`、`lang`、`slug`、`description` の必須項目チェックと、記事専用項目 (`date`、`updated`、`categories`、`tags`) の禁止チェック
- 値の形式チェック (`lang` が `ja`/`en` のみ、`slug` の kebab-case と文字数上限、`date`/`updated` の ISO 8601 形式)
- 未定義の Front Matter キーの検出
- 翻訳ペア以外での `slug` 重複の検出

旧 WordPress URL から新 URL へのリダイレクトには `hexo-generator-alias` を使用します。移行対象の Front Matter には、必要に応じて次のような alias を設定します。

```yaml
alias:
  - /2024/12/02/1878/
```

alias は移行した記事と固定ページを中心に管理し、将来追加する場合も URL の互換性を確認してから登録します。

## Front Matter の記述規則

記事には、次の Front Matter を使用します。`title`、`date`、`updated`、`lang`、`slug`、`categories`、`tags`、`description` は必須とします。`alias` は旧 URL との互換性が必要な場合だけ設定します。

```yaml
title: Example post
date: 2026-08-19T22:45:36+09:00
updated: 2026-08-19T22:45:36+09:00
lang: ja
slug: example-post
categories:
  - Technology
tags:
  - Microsoft Graph
description: 記事の内容を要約する説明文です。
alias:
  - /2024/12/02/1878/
```

固定ページには、`title`、`lang`、`slug`、`description` を必須項目として使用します。固定ページでは `date`、`updated`、`categories`、`tags` を使用せず、生成する HTML にも表示しません。`alias` は記事と同様に、旧 URL との互換性が必要な場合だけ設定します。

- `date` と `updated` は、タイムゾーンを含む ISO 8601 形式 (`YYYY-MM-DDTHH:mm:ss+09:00`) で記述します。記事では `updated` を省略せず、初回公開時も `date` と同じ日時を設定します。
- `lang` は `ja` または `en` だけを使用します。
- `slug` は英語小文字、数字、ハイフンだけを使用する kebab-case とし、ハイフンを含めて 60 文字以下とします。
- `slug` は、同じ記事または固定ページの ja/en 翻訳ペアだけで共有できます。翻訳ペア以外では、記事と固定ページをまたいでサイト全体で一意にします。
- `categories` は記事が主に扱う技術を表します。`Microsoft Graph`、`Exchange Online PowerShell`、`Outlook Add-ins` のような値を使用します。
- `tags` は記事内容に関連するキーワードを表します。カテゴリ名をそのままタグに設定しても構いません。
- `categories` と `tags` は、記事の言語を問わず英語表記を使用します。複数単語は `Microsoft Graph` のように各単語の先頭を大文字にします。
- `description` は、日本語では 120 文字程度、英語では 160 文字程度を目安にします。
- `alias` の並び順には意味を持たせません。移行対象では元の WordPress URL を末尾スラッシュの有無を含めて正確に記録します。WordPress は日本語コンテンツだけだったため、WordPress から移行したコンテンツの alias は ja 側だけに設定し、旧 URL から ja 側へリダイレクトします。en 側には同じ alias を設定しません。
- 移行後に URL を変更する場合は、変更前の ja ページから変更後の ja ページへ、変更前の en ページから変更後の en ページへ、それぞれ同じ言語のページに個別の alias を設定します。同じ alias を ja/en の両方に設定しません。
- `title` と `description` などの文字列は、YAML の解釈に引用符が必要な場合だけ引用符で囲みます。
- ja/en の翻訳ペアは、内容が大きく異なる場合も同じ slug を使用します。
- 翻訳ペアの記事末尾には、もう一方の言語版へのリンクを追加しません。言語切り替え UI を使用します。

### カテゴリとタグの運用ルール

カテゴリとタグは、既存の WordPress 分類をそのまま引き継がず、記事の内容に基づいて新たに設定します。

- カテゴリは、もっとも当てはまるものを 1 つだけ指定します。
- カテゴリは、まず記事で主に扱う API を基準にします。
- 該当する API がない場合は、主に扱うテクノロジーを基準にします。
- API とテクノロジーのいずれも該当しない場合は、主に扱う製品またはサービスを基準にします。
- カテゴリの例は `Microsoft Graph`、`Exchange Web Services`、`Outlook Add-ins`、`Outlook REST API`、`PowerShell`、`.NET`、`Microsoft 365`、`Exchange Online`、`Exchange Server`、`Outlook`、`Outlook.com` です。
- タグは複数指定できます。
- タグには、記事で扱う API、テクノロジー、製品またはサービスを必要に応じて指定します。
- カテゴリ名は、必ずタグにも指定します。
- 開発言語は、記事で使用していても必ずしもタグに指定しません。
- カテゴリとタグは英語表記で統一します。製品名やアプリケーション名は正式な表記を使用します。
- `Office 365 Reporting Web Services` は複数形で統一します。
- `Office365APIEditor` はアプリケーション名の正式表記として、スペースを入れずに記述します。

`hexo generate` の前にカスタム検証スクリプトを実行します。記事または固定ページごとに必須項目、許可項目、値の形式を検証し、必須項目の不足、禁止項目、未定義の Front Matter、形式違反、翻訳ペア以外での slug の重複を検出した場合はビルド エラーとして停止します。

## リポジトリ構成の方針

日本語記事と英語記事は、`source/_posts/ja/` と `source/_posts/en/` のようにディレクトリを分割して管理します。固定ページも同様に `source/ja/` と `source/en/` を切って配置します。

記事の画像は Hexo のページごとのアセット フォルダー機能 (`post_asset_folder: true`) を使用し、各記事のアセット フォルダー内に配置します。固定ページの画像は `source/ja/<slug>/assets/` または `source/en/<slug>/assets/` に配置します。

Hexo 本体の設定はリポジトリ ルートの `_config.yml` で管理し、`timezone` は `Asia/Tokyo` に設定します。テーマの設定は `themes/hexo-theme-landscape/_config.yml` で管理します。

依存パッケージは npm で管理し、`node_modules` は `.gitignore` によって Git 管理対象から除外します。

テーマは `themes/landscape/` にリポジトリ内で直接配置し、Git で管理します。アップストリームの自動追従は行わず、必要に応じて手動でカスタマイズします。

ソース (Markdown、テーマ、設定ファイルなど) は `main` ブランチで管理し、ビルド成果物は `gh-pages` ブランチへ GitHub Actions が公開します。ソース ブランチと公開ブランチは明確に分離します。

## 言語選択ページの実装方針

言語選択ページは、ブラウザーの言語設定に応じて `/ja/` または `/en/` の対応するページへ JavaScript でリダイレクトする静的な `index.html` とします。

記事作成の負担を減らすため、次の仕組みを導入します。

- 記事作成時は、npm スクリプト等でラップした `hexo new` の実行によって、`source/_posts/ja/` と `source/_posts/en/` に同じ slug のファイルを同時に生成します。
- `hexo generate` 実行時は、Hexo のカスタム Generator (`hexo.extend.generator.register()`) を自作し、同じ slug を持つ ja/en の記事または固定ページのペアごとに言語選択ページ (`/<slug>/index.html`) を自動生成します。
- カスタム Generator は `scripts/` 配下に配置し、`hexo generate` 実行時に自動的に読み込まれるようにします。

標準の `hexo-generator-index` は使用せず、カスタム Generator がトップページ (`/`) の言語別リダイレクトと、`/ja/` および `/en/` の言語別記事一覧を生成します。言語別記事一覧は `hexo-pagination` と Landscape の `index`/`archive` レイアウトを使用し、既定トップページと同じ記事カード、サイドバー、ページネーションを適用します。言語選択ページのロジックは、トップページ (`/`) と記事/固定ページ (`/<slug>/`) で共通の実装を使い回します。

ja/en いずれか一方の言語しか存在しない slug については、カスタム Generator が自動判定し、存在する言語で「翻訳準備中」の案内と、既存ページへのリンクを表示する簡易ページを生成します。両言語が揃った場合のみ、通常の JavaScript リダイレクト ページを生成します。

JavaScript が無効なブラウザーへの配慮は行わず、対応対象から除外します。ただし、検索エンジンのクローラー対策として、言語選択ページの HTML には JavaScript とは別に `<noscript>` タグまたは通常の `<a>` タグで両言語ページへの実体リンクを埋め込み、クローラーが両言語ページを確実に発見できるようにします。

両言語が揃っている記事および固定ページには、`<head>` に `hreflang` の `alternate` リンクを付与し、検索エンジンに言語別ページの対応関係を伝えます。片方の言語しか存在しない場合は付与しません。

```html
<link rel="alternate" hreflang="ja" href="https://blog.rykoma.net/ja/my-slug/">
<link rel="alternate" hreflang="en" href="https://blog.rykoma.net/en/my-slug/">
```

## 移行ステップ

### Phase 1: 設計

移行後の URL、言語、コンテンツ形式、リポジトリ構成を先に確定します。

- URL 設計
- 多言語設計
- Front Matter 設計
- リポジトリ構成決定

設計時に、記事本文、固定ページ、画像、カテゴリ、タグ、公開日、更新日、旧 URL、alias の対応関係を定義します。

### Phase 2: 資産整理

WordPress から移行対象を棚卸しし、欠落や重複を把握します。

- 記事一覧作成
- 固定ページ一覧作成
- 画像資産整理
- 既存カテゴリとタグの精査
- URL マッピング作成

URL マッピングには、少なくとも旧 URL、新 URL、言語、コンテンツ種別、移行状況、確認状況を記録します。既存記事のカテゴリとタグは移行時に精査し、Front Matter の記述規則に従って設定します。不要な下書き、重複画像、未使用資産は移行対象から明確に除外します。

### Phase 3: Hexo 構築

Hexo の実行環境と公開経路を構築します。

- Hexo 初期設定
- `hexo-theme-landscape` の設定
- `hexo-generator-alias` の設定
- GitHub Actions 設定
- GitHub Pages 設定
- `blog.rykoma.net` のカスタム ドメイン設定

GitHub Actions はソース ブランチからサイトをビルドし、生成物を `gh-pages` ブランチへ公開します。公開設定、権限、`CNAME`、必要なシークレットを確認し、ビルド失敗を検知できるようにします。切り替え前の検証期間は既定の GitHub Pages FQDN で確認できるように、通常デプロイでは `CNAME` を生成しません。独自ドメインへの切り替え時にだけ、手動実行の入力を使って `CNAME` を生成して公開します。

検証時は `_config.github-pages.yml` を追加指定し、`--url https://rykoma.github.io/Docs` と `--root /Docs/` でビルドします。`root` を `/Docs/` にすることで、CSS、JavaScript、画像などのアセットを GitHub Pages のプロジェクト サイト配下から参照します。検証時は `CNAME` を生成しません。

独自ドメインへ切り替える際は `_config.yml` の `url: https://blog.rykoma.net` と `root: /` を使用し、`--url https://blog.rykoma.net` と `--root /` でビルドします。この場合だけ手動実行の `enable_cname: true` を指定して `public/CNAME` に `blog.rykoma.net` を生成します。`deploy_url` と `deploy_root` の組み合わせは、検証時は `https://rykoma.github.io/Docs` と `/Docs/`、切り替え時は `https://blog.rykoma.net` と `/` に固定します。

### 開発プレビューと検証コマンド

ローカルでは `npm ci` と `npm run build` で生成を確認し、`npm run server -- --port 4001` でプレビューします。`http://localhost:4001/ja/` または `http://localhost:4001/en/` が Landscape の言語別トップページです。ルート (`/`) はブラウザー言語に応じて言語別トップページへ移動する選択ページです。ポート `4000` は別 worktree のサーバーが使用している場合があるため、作業中の worktree では `4001` を使用します。

検証時は次の 2 種類の生成を行い、言語切り替え URL、テーマ アセット、記事 URL が環境ごとに正しいことを確認します。

```powershell
npx hexo generate --config _config.yml,_config.github-pages.yml --url https://rykoma.github.io/Docs --root /Docs/
npx hexo generate --config _config.yml --url https://blog.rykoma.net --root /
```

確認済みの基盤機能は、Landscape の `index` / `archive` レイアウトによる `/ja/`・`/en/`、ページ内言語切り替え、`/` と `/<slug>/` の言語選択ページ、`/Docs/` と `/` の URL ルート切り替えです。Phase 4 の共通機能準備が完了するまで、本格的な記事移行は開始しません。

代表サンプルの移行では、次の運用上の注意点を確認しました。

- `hexo-generator-alias` の alias は、ローカル プレビューでも `_config.yml` の `url` に基づく本番 URL への HTML リダイレクトを生成します。ローカルで旧 URL を確認すると本番サイトへ移動するため、未公開の新 URL では本番サイトの 404 が表示されます。alias の確認は生成されたリダイレクト HTML の遷移先を確認するか、公開後に本番 URL で行います。
- WordPress の言語共通 URL に対する alias は静的なリダイレクトです。WordPress の日本語コンテンツを移行した旧 URL は ja 側だけに alias を設定し、ja 側へリダイレクトします。英語版へはページ内の言語切り替え UI を使用します。
- `post_asset_folder: true` の記事画像は、記事 Markdown と同名のアセット フォルダーに置き、`asset_path` タグを使って参照します。通常の相対 Markdown 画像参照では `/Docs/` などの project site root を正しく反映できない場合があります。

### Phase 4: サイト体験・共通機能準備

記事の本格的な移行を始める前に、Landscape テーマのデザインと、言語に依存する共通機能を完成させます。

ページ内言語切り替えと言語別トップページの基盤は実装済みですが、Phase 4 全体は未完了です。次の共通機能と品質確認が完了するまで、Phase 5 の本格的なコンテンツ移行には進みません。

- Landscape テーマのカスタマイズとブログ全体のデザイン見直し
- ページ内言語切り替え UI の確認
- Archives、categories、tags の多言語対応
- 自動生成ページでの ja/en 記事の重複表示防止
- Recent posts ウィジェットの多言語対応
- RSS の実装
- 404 ページと、記事が 0 件の言語別トップ・分類ページの表示方針確認
- 移行前のビルド、リンク、画像、Front Matter 検証の準備
- 代表コンテンツによる Markdown、コード、表、画像、外部リンクの表示確認
- アクセシビリティとレスポンシブ表示の確認
- コードブロックのデザインと機能 (シンタックス ハイライト、折り返し、コピー操作など) の確認
- 記事の共有リンクの動作とデザインの確認
- favicon、robots、サイトマップ、canonical、hreflang の実装方針整理

SEO の方針は次のとおりとします。言語選択ページ (`/`、`/<slug>/`) は `noindex` とし、canonical を付けず、sitemap から除外します。実コンテンツ、言語別トップ、記事が存在する分類・Archive は self-canonical とし、sitemap に含めます。ページネーションは `noindex,follow` とし、sitemap から除外します。翻訳対応するページだけ `ja` / `en` の hreflang を相互指定し、`x-default` は使用しません。canonical、hreflang、robots.txt、sitemap の URL は `site.url` と `site.root` から生成します。

ここでいう「記事が 0 件のページ」とは、まだその言語の記事が 1 件もない言語別トップページ、該当する記事がない category / tag ページ、記事が存在しない archive ページを指します。これらのページを生成するか、404 とするか、また生成する場合に利用者へどのような案内を表示するかを Phase 4 で決めます。

Archives、categories、tags、Recent posts ウィジェットは、表示中の言語の記事だけを対象とします。Recent posts ウィジェットでは、表示中の言語に対応する記事タイトルだけを表示し、翻訳ペアによる重複を発生させません。RSS は言語別フィードを基本とし、フィード URL と各言語ページからのリンクを確定します。

サイドバーは言語依存の部分テンプレート キャッシュを無効化し、category、tag、tag cloud、archive、Recent posts を表示中の言語で再描画します。Archives、categories、tags の標準生成を言語別カスタム Generator に置き換え、言語指定のない分類 URL と年/月別 URL にはブラウザー言語に応じた選択ページを生成します。日本語の月表示は `2026 年 8 月` 形式とします。

Phase 4 の自動生成ページでは、category / tag の一覧ページ (`/categories/`、`/tags/`) は提供せず、個別の分類ページだけを生成します。記事が存在しない言語別分類ページ、年月別ページ、その他の未生成 URL も生成せず、利用者が直接アクセスした場合は 404 とします。ページネーションは代表コンテンツまたは実際のコンテンツ移行時に確認し、現時点ではダミー記事を追加しません。

Recent posts の「重複しないこと」は、同じ翻訳ペアを日本語ページと英語ページに混在させないことを指します。各ウィジェットが表示中の言語の記事だけを対象にすることで担保し、独立したコンテンツ品質検証の対象にはしません。代表記事の Markdown 品質、アクセシビリティ、SEO、404、サイトマップなどは、このサブタスクとは別の Phase 4 作業として扱います。

記事の翻訳ペアが未完成でもサイト全体をビルドできるようにし、存在しない翻訳を自動生成したり、別言語の記事を重複表示したりしないことを確認します。

Phase 5 の本格的な移行前に、代表例として少なくとも 1 件の日本語 / 英語の翻訳ペアを移行し、実際の移行手順で確認します。コード、表、画像、内部リンク、外部リンクなどを含む記事を選び、トップページ、記事ページ、分類ページ、Recent posts、RSS、言語切り替え、GitHub Pages の `/Docs/` 配下で表示と URL を確認します。この代表例は本格移行の対象件数には含めず、問題を修正した後に Phase 5 の全件移行を開始します。

また、移行前に Front Matter の必須項目と値の形式、slug の重複、alias の形式、内部リンク、画像参照を自動検証できるようにします。代表例での確認と自動検証を先に行うことで、記事移行後の表示崩れや一括修正を防ぎます。

コードブロックのデザインと機能の確認では、`http-request` / `http-response` という 2 種類の独自シンタックス ハイライト言語 (`scripts/http-highlighter.js`) を実装しました。HTTP のリクエスト / レスポンスをコード ブロックで記述する記事を移行する際は、言語指定を `http` ではなく、内容に応じて `http-request` または `http-response` としてください。それ以外の言語 (JSON、PowerShell、C#、JavaScript など) は、highlight.js が標準対応する言語名をそのまま指定します。

### Phase 5: コンテンツ移行

整理した資産を Hexo のコンテンツとして登録し、表示とリンクを修正します。

- 記事移行
- 固定ページ移行
- 画像移行
- alias 設定
- 内部リンク修正
- 日本語と英語のコンテンツ確認

Front Matter の `title`、`date`、`updated`、`lang`、`slug`、`categories`、`tags`、`description` などを統一します。機械翻訳を使用した場合は、人間が内容、固有名詞、リンク、表記を確認します。

コード ブロックの言語指定にも注意してください。特に HTTP のリクエスト / レスポンスを記述するコード ブロックは、`http` ではなく `http-request` (リクエスト) または `http-response` (レスポンス) を言語指定として使用します (詳細は Phase 4 の記載および `scripts/http-highlighter.js` を参照)。

### Phase 6: 公開

移行先を段階的に確認してから、独自ドメインの公開先を切り替えます。

- 独自ドメイン切り替え
- Analytics 設定
- AdSense 設定
- 動作確認
- リダイレクト確認
- 切り戻し手順確認

トップ、言語選択、記事、固定ページ、画像、404 ページ、旧 WordPress URL を確認します。Google Analytics と Google AdSense がテーマ変更後も正しく動作すること、canonical URL や言語 alternate が期待どおりであることを確認します。

Phase 6 で判断する検討事項は次のとおりです。

- 言語選択ページの canonical URL の扱い (言語選択ページに `noindex` を付与するか、実コンテンツ ページを直接インデックスさせるか)
- 記事/固定ページの言語選択ページ (`/<slug>/`) で、ブラウザー言語が ja/en どちらでもない場合の既定言語 (トップページと同様に日本語優先とするか)
- `sitemap.xml` に言語選択ページと実コンテンツ ページの両方を載せるか、実コンテンツ ページだけにするか (canonical の方針と連動)
- 404 ページの多言語対応 (ブラウザー言語で ja/en の 404 ページへ振り分けるか、単一の共通 404 ページにするか) → Phase 4 で、リクエスト パスの `/ja/` `/en/` プレフィックスを優先し、プレフィックスがない場合のみブラウザー言語で判定する方式を採用済み (`scripts/multilingual-generator.js` の `not-found-pages` ジェネレーター)
- Google Analytics を設定する際は、404 ページ (`404.html`、`ja/404.html`、`en/404.html`) が通常ページの `head.ejs` を経由しない独立レイアウトであるため、計測タグを個別に追加しないと 404 ページのアクセスが計測から漏れる。Analytics 設定時に `not-found-pages` ジェネレーター側にも計測タグを追加する対応が必要

### Phase 7: 廃止

新サイトの安定稼働と切り戻し不要の判断後に、旧環境を廃止します。

- WordPress 停止
- Azure リソース削除
- 移行完了確認

削除前に、必要なバックアップ、ログ、DNS 設定、課金情報、復旧に必要な情報を保存します。削除対象と実行日を記録し、Azure に不要な関連リソースが残っていないことを確認します。

## 管理用チェックリスト

### Phase 1: 設計

- [x] URL 設計を確定した
- [x] `/ja/` と `/en/` の多言語構成を確定した
- [x] 言語選択ページとコンテンツ ページを分離した
- [x] Front Matter の項目と記述規則を確定した
- [x] リポジトリ構成を確定した
- [x] URL 構造、alias、独自ドメインを変更しない方針を確認した

### Phase 2: 資産整理

- [x] 移行対象の記事一覧を作成した
- [x] 移行対象の固定ページ一覧を作成した
- [x] 画像資産を一覧化し、参照関係を確認した
- [x] 旧 URL と新 URL のマッピングを作成した
- [x] 日本語と英語の対応関係を記録した
- [x] 除外する下書き、重複、未使用資産を記録した

### Phase 3: Hexo 構築

- [x] Hexo を初期化した
- [x] `hexo-theme-landscape` を設定した
- [x] `hexo-generator-alias` を設定した
- [x] ローカル ビルドが成功した
- [x] GitHub Actions のビルドとデプロイを設定した
- [x] `gh-pages` ブランチへの公開を確認した
- [x] GitHub Pages の公開設定を確認した
- [x] 必要な権限とシークレットを最小限に設定した

### Phase 4: サイト体験・共通機能準備

- [x] Landscape の既定レイアウトを使用した言語別トップページを生成できる
- [x] ページ内言語切り替え UI の基本動作を確認した
- [ ] Landscape テーマのデザインを見直し、カスタマイズを確定した
- [x] Archives、categories、tags を言語別に表示できる
- [x] 自動生成ページで ja/en 記事が重複表示されない
- [x] Recent posts ウィジェットを表示中の言語に対応させた
- [x] Recent posts ウィジェットで翻訳ペアが重複表示されない
- [x] 言語別 RSS (`/ja/rss.xml`、`/en/rss.xml`) を生成し、ヘッダー アイコンと `<head>` の feed link を確認した
- [x] RSS item の description 必須チェックを追加した (本文全体・抜粋へのフォールバックを廃止)
- [x] RSS item 数の上限を検討し、実装した (`feed.limit: 20`、hexo-generator-feed の既定値と一致)
- [x] RSS の `pubDate` の扱い (公開日時のみ、更新日時は反映しない) を確認した
- [x] RSS の `description` はプレーンテキスト限定とし、HTML タグらしき記述を検出するチェックを追加した
- [x] RSS フィードを W3C Feed Validator 等で検証した (Direct Input モードで ja/en とも Valid RSS feed、公開後は URL 指定モードでの再検証を推奨)
- [x] 404 ページと、記事が 0 件の言語別トップ・分類ページの表示方針を確定した
- [x] 移行前の Front Matter、リンク、画像検証を準備した
- [x] 記事・固定ページの Front Matter 全体を検証するスクリプトを整備した (`title`/`date`/`updated`/`lang`/`slug`/`categories`/`tags`/`description` の必須項目、固定ページでの記事専用項目の禁止、`lang`/`slug`/日時形式の妥当性、未定義キーの検出、翻訳ペア以外での `slug` 重複検出)
- [x] Phase 5 の本格移行前に、3 件の日本語 / 英語の代表例 (画像付き記事、画像なし記事、固定ページ) を移行し、Markdown、コード、画像、内部リンク、外部リンクを確認した
- [x] アクセシビリティとレスポンシブ表示を確認した (キーボード フォーカス順序・可視化をヘッダー / メイン領域 / 右サイドバー / フッターの全域で確認・改善、本文へのスキップ リンク、レスポンシブ表示・色コントラスト・画像 alt・言語切り替えの一貫性を確認。スクリーンリーダー対応は今回の移行作業の対象外とする)
- [x] コードブロックのデザインと機能 (シンタックス ハイライト、折り返し、コピー操作など) を確認した (言語ヘッダー表示、コピー / すべて選択ボタン、独自 `http-request` / `http-response` ハイライターを実装。Phase 5 では HTTP コード ブロックの言語指定に `http-request` / `http-response` を使用する)
- [x] 記事の共有リンクの動作とデザインを確認した (Twitter 表記と古い共有 URL を更新し、X ( https://x.com/intent/post )、Facebook ( sharer/sharer.php )、Pinterest ( pin/create/button、description 付き)、LinkedIn ( sharing/share-offsite ) の最新エンドポイントに変更。X アイコンはアイコン フォント依存をやめて記号表示に切り替え、位置・ホバー色・[共有] テキストとの間隔、キーボード フォーカス時の表示を調整した)
- [x] 本文へのスキップ リンクを追加し、キーボード フォーカス時の表示と本文への移動を確認した
- [x] 404 ページを作成した (ルート `404.html` がリクエスト パスの言語プレフィックスを優先し、ない場合はブラウザー言語で判定して `ja/404.html` / `en/404.html` へリダイレクト。ヘッダー (背景 + ブログタイトルのみ)、本文、favicon、`noindex, nofollow` を実装済み)
- [x] モバイル表示でのタッチ ターゲット サイズ (リンク・ボタンの目安 44×44px) を確認した
- [ ] ブラウザーの拡大表示 (200% 目安) でヘッダー・サイドバー・記事本文が崩れないことを確認した
- [ ] 検索フォームなどのフォーム要素で label と入力欄が適切に関連付けられているか確認した
- [x] favicon のデザインを確定し、`source/favicon.png` / `source/favicon.svg` を反映した
- [x] robots、サイトマップ、canonical、hreflang の方針を整理し、実装した

### Phase 5: コンテンツ移行

- [ ] 記事を Markdown に移行した
- [ ] 固定ページを Markdown に移行した
- [ ] 画像を移行し、表示を確認した
- [ ] 各移行コンテンツに必要な alias を設定した
- [ ] 内部リンクを新 URL に修正した
- [ ] 日本語コンテンツを人間が確認した
- [ ] 英語コンテンツを人間が確認した
- [ ] 見出し、コード、表、画像 alt text を確認した
- [ ] HTTP のリクエスト / レスポンスを記述するコード ブロックに `http-request` / `http-response` の言語指定を使用した
- [ ] 不正なリンク、欠落画像、不要な HTML を確認した

### Phase 6: 公開

- [ ] `/` からブラウザー言語別にリダイレクトできる
- [x] 言語指定のない URL からブラウザー言語別にリダイレクトできる
- [ ] `/ja/` と `/en/` のトップを確認した
- [ ] 日本語と英語の記事、固定ページを確認した
- [ ] 旧 WordPress URL から新 URL へリダイレクトできる
- [ ] 404 ページを確認した
- [ ] `blog.rykoma.net` の `CNAME` を設定した
- [ ] 独自ドメインで HTTPS 接続できる
- [ ] Google Analytics の計測を確認した
- [ ] Google AdSense の表示と計測を確認した
- [ ] canonical URL、言語 alternate、サイトマップを確認した
- [ ] robots 設定と主要な SEO 情報を確認した
- [ ] 切り戻し手順と判断条件を確認した

### Phase 7: 廃止

- [ ] 新サイトの公開後の安定稼働を確認した
- [ ] 最終バックアップを取得した
- [ ] WordPress の停止日と担当作業を記録した
- [ ] Azure 上の削除対象リソースを確定した
- [ ] Azure リソースを削除した
- [ ] 不要な DNS、シークレット、課金リソースが残っていないことを確認した
- [ ] 移行完了日と残課題を記録した

## 完了条件

次のすべてを満たした時点で移行完了とします。

1. 日本語と英語のコンテンツが `/ja/` と `/en/` で表示できる。
2. 旧 WordPress URL の主要なアクセスが新 URL に到達できる。
3. GitHub Actions でビルドと `gh-pages` へのデプロイを再実行できる。
4. `blog.rykoma.net` で HTTPS 配信できる。
5. Google Analytics と Google AdSense が継続して動作する。
6. 主要なリンク、画像、SEO 情報に問題がない。
7. Azure 上の旧 WordPress を廃止してよいと判断でき、削除記録が残っている。
