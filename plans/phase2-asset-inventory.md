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

## 次の作業

1. `wordpress-content-decisions.csv` の `Slug`、`New categories`、`New tags`、`Migration status` を入力します。`Language` は全行で `ja` とします。
2. `wordpress-url-mapping.csv` を再生成し、新 URL が `/ja/<slug>/` になっていることを確認します。
3. 画像の実際の参照先を記事本文と照合し、重複または未使用の資産を除外します。
4. `Verification status` を、確認段階に応じて更新します。
