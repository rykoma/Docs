# WordPress エクスポートの棚卸し記録

この記録は、WordPress のエクスポート XML から生成しました。エクスポート XML 自体は資格情報などを含む可能性があるため、リポジトリには追加しません。

| 項目 | 値 |
| --- | --- |
| 生成日時 (JST) | 2026-08-22T22:18:03+09:00 |
| XML の SHA-256 | bc7fac307bfded421a701951711f52656327dd73449d6672a8199afd4943c4af |
| 公開記事 | 75 |
| 公開固定ページ | 4 |
| 添付ファイル | 94 |
| 除外記録 | 9 |

## 生成ファイル

- wordpress-content-source-inventory.csv: 公開記事と公開固定ページの XML 上のメタデータ
- wordpress-content-decisions.csv: 記事ごとに決定する言語、slug、新しいカテゴリとタグ、移行状況
- wordpress-url-mapping.csv: 旧 URL と、言語と slug から導出した新 URL の対応
- wordpress-asset-inventory.csv: 添付ファイルと WordPress 上の親コンテンツの対応
- wordpress-exclusions.csv: 下書きと移行対象外の WordPress 内部レコード

## 次の判断

各公開コンテンツについて、slug、新しいカテゴリとタグ、移行可否を確認します。新 URL は、承認済みの /ja/<slug>/ または /en/<slug>/ のみを使用します。
