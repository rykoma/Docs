# Phase 2: 資産整理

WordPress のエクスポート XML を入力に、移行対象と除外対象を記録します。XML 自体は、著者情報などの非公開情報を含むため、リポジトリに追加しません。

## 再生成方法

PowerShell で次のコマンドを実行します。

```powershell
.\tools\export-wordpress-inventory.ps1 -ExportPath <WordPress エクスポート XML の絶対パス>
```

生成される CSV と記録ファイルは `plans/` に保存されます。`wordpress-content-decisions.csv` だけを手動で編集し、ほかの生成ファイルは編集しません。

## 管理対象

- `wordpress-content-source-inventory.csv`: 公開記事と公開固定ページの XML 上のメタデータ
- `wordpress-content-decisions.csv`: 記事単位の移行判断
- `wordpress-url-mapping.csv`: 旧 URL と導出済みの新 URL
- `wordpress-asset-inventory.csv`: 添付ファイルと WordPress の親コンテンツ
- `wordpress-exclusions.csv`: 下書きと WordPress の内部レコード
- `wordpress-export-inventory.md`: 入力 XML のハッシュと集計

## 確定結果

- 公開記事 75 件と公開固定ページ 4 件を棚卸ししました。
- すべての公開コンテンツを日本語 (`ja`) として記録しました。英語コンテンツおよび翻訳ペアは、今回のエクスポートにはありません。
- 移行対象は 78 件、移行対象外は固定ページ ID 1289 の 1 件です。ID 1289 は旧 Contact Form 7 ページで、現行の問い合わせページ ID 1862 に統合する判断です。
- 添付ファイル 94 件のうち 89 件を移行対象としました。
- 添付ファイル ID 5 は確認の結果、移行対象外としました。ID 9、10、61、81 は本文で参照されない RSS または SNS アイコンのため、移行対象外としました。新サイトで必要になった場合は、別途準備します。
- 記事ごとに slug、カテゴリ、タグを決定し、カテゴリ名はタグにも含めました。
- ID 1296 の slug は 60 文字制限に合わせて `check-delegate-private-calendar-permissions-powershell` としました。
- 旧 URL と新 URL のマッピングを作成し、新 URL の重複がないことを確認しました。
- 入力 XML はリポジトリに追加せず、SHA-256 を `wordpress-export-inventory.md` に記録しました。

## 次の作業

Phase 3 として Hexo の実行環境、設定、テーマ、alias、GitHub Actions、GitHub Pages の構築に進みます。
