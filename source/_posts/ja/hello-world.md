---
title: Hello World
date: 2026-08-19T22:45:36+09:00
updated: 2026-08-19T22:45:36+09:00
lang: ja
slug: hello-world
categories:
  - Hexo
tags:
  - Hexo
description: Hexo で構築したブログの最初のサンプル記事です。
---

これは Hexo で構築したブログの日本語サンプル記事です。

英語版は [Hello World](../../en/hello-world/) から確認できます。

## 複数行 JSON

```json
{
    "name": "hello-world",
    "version": "1.0.0",
    "keywords": [
        "hexo",
        "sample"
    ]
}
```

## 1 行 PowerShell

```powershell
Get-ChildItem -Path . -Filter *.md | Select-Object -First 5
```

## 複数行 PowerShell

```powershell
$posts = Get-ChildItem -Path .\source\_posts -Recurse -Filter *.md
foreach ($post in $posts) {
    Write-Output $post.FullName
}
```

## 1 行 C#

```csharp
Console.WriteLine("Hello, World!");
```

## 複数行 C#

```csharp
public class Greeter
{
    public string Greet(string name)
    {
        return $"Hello, {name}!";
    }
}
```

## 1 行 JavaScript

```javascript
console.log("Hello, World!");
```

## 複数行 JavaScript

```javascript
function greet(name) {
    return `Hello, ${name}!`;
}

console.log(greet("World"));
```

## HTTP リクエスト (メソッドと URL のみ)

```http-request
GET https://blog.rykoma.net/ja/hello-world/
```

## HTTP リクエスト (メソッドと URL とヘッダー)

```http-request
GET https://blog.rykoma.net/ja/hello-world/
Accept: text/html
Accept-Language: ja
```

## HTTP リクエスト (メソッドと URL とヘッダーとボディ)

```http-request
POST https://example.com/api/comments
Content-Type: application/json

{
    "postSlug": "hello-world",
    "comment": "はじめまして。"
}
```

## HTTP リクエスト (メソッドと URL とボディ)

```http-request
POST https://example.com/api/comments

{
    "postSlug": "hello-world",
    "comment": "はじめまして。"
}
```

## HTTP レスポンス (ステータス コードのみ)

```http-response
200 OK
```

## HTTP レスポンス (ステータス コードとヘッダーのみ)

```http-response
200 OK
Content-Type: text/html; charset=utf-8
```

## HTTP レスポンス (ステータス コードとヘッダーとボディ)

```http-response
201 Created
Content-Type: application/json

{
    "id": "12345",
    "postSlug": "hello-world",
    "comment": "はじめまして。"
}
```

## HTTP レスポンス (ステータス コードとボディのみ)

```http-response
404 Not Found

{
    "error": "Post not found"
}
```
