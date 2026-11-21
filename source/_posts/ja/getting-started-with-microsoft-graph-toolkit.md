---
title: Microsoft Graph Toolkit の試し方
date: 2019-12-22T01:29:18+09:00
updated: 2026-11-21T22:15:42+09:00
lang: ja
slug: getting-started-with-microsoft-graph-toolkit
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft Graph Toolkit
  - Visual Studio Code
description: Microsoft Graph Toolkit の Login、Person、Get コンポーネントを使用する、執筆当時の手順を紹介します。
alias:
  - /2019/12/22/1448/
---

> [!WARNING]
> Microsoft Graph Toolkit は 2026 年 8 月 28 日に提供終了し、メンテナンスとサポートは終了しています。詳細は [Microsoft Graph Toolkit の提供終了に関するお知らせ](https://devblogs.microsoft.com/microsoft365dev/microsoft-graph-toolkit-retirement/)を参照してください。以下は執筆当時の手順であり、現在の環境でそのまま動作することは保証されません。

Web アプリケーションで Microsoft Graph を使用しやすくするため、[Microsoft Graph Toolkit](https://learn.microsoft.com/en-us/graph/toolkit/overview) にはいくつかのコンポーネントが用意されています。簡単に使い方を紹介します。

まずは Overview のページに記載の内容を実践しつつ、[MSAL provider](https://learn.microsoft.com/en-us/graph/toolkit/providers/msal) と [Login component](https://learn.microsoft.com/en-us/graph/toolkit/components/login) を使います。

## Visual Studio Code の準備

ここではコード エディターとして Visual Studio Code を使います。ローカルでのデバッグ用に拡張機能の [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) をインストールしておきます。

また、Visual Studio Code のワークスペースを作成して新しいフォルダーを用意します。今回は、CodeWorkspace というワークスペースの下に GraphToolkitTest01 というフォルダーを作りました。

<img src="{% asset_path 2019122101.png %}" alt="Visual Studio Code のワークスペースに作成した GraphToolkitTest01 フォルダー">

そして GraphToolkitTest01 に `index.html` を作ります。一旦ファイルさえあればよいので、中身は空のままで問題ありません。

Visual Studio Code の右下に [Go Live] ボタンが表示されているので、クリックします。すると Live Server でホストされた `index.html` が表示されるので、URL をコピーします。今回は `http://127.0.0.1:5500/GraphToolkitTest01/index.html` を例として進めます。

## アプリの登録

Azure Active Directory にアプリを登録します。ここでは、登録したテナントでしか利用できないアプリを登録します。

1. [Azure Portal](https://portal.azure.com/) にサインインします。
2. [Active Directory] - [アプリの登録] - [新規登録] をクリックします。
3. [名前] に任意のアプリの名前を入力します。(例: GraphToolkitTest01)
4. [サポートされているアカウントの種類] から [この組織のディレクトリ内のアカウントのみ] を選択します。
5. [リダイレクト URI] で [Web] を選択し、先ほど Live Server で表示した `index.html` の URL を入力します。ただし `127.0.0.1` は `localhost` に変えます。(例: `http://localhost:5500/GraphToolkitTest01/index.html`)
6. [登録] をクリックします。
7. 表示された [アプリケーション (クライアント) ID] の値を控えておきます。
8. [管理] - [認証] をクリックします。
9. [暗黙の付与] の [アクセス トークン] と [ID トークン] のチェックをオンにして、[保存] をクリックします。

## コーディング

Visual Studio Code で `index.html` に以下のように HTML を記述します。

```html
<html>

<head>
    <script src="https://unpkg.com/@microsoft/mgt/dist/bundle/mgt-loader.js"></script>
</head>

<body>
    <mgt-msal-provider client-id="[登録したアプリの アプリケーション (クライアント) ID]" authority="https://login.microsoftonline.com/[テナント名]"></mgt-msal-provider>
    <mgt-login></mgt-login>
</body>

</html>
```

実際の値を入れた場合は以下のようになります。

```html
<html>

<head>
    <script src="https://unpkg.com/@microsoft/mgt/dist/bundle/mgt-loader.js"></script>
</head>

<body>
    <mgt-msal-provider client-id="1d852daa-5f3b-4727-afde-80714fbe9577" authority="https://login.microsoftonline.com/contoso.onmicrosoft.com/"></mgt-msal-provider>
    <mgt-login></mgt-login>
</body>

</html>
```

書けたら `index.html` を保存します。

ここでは MSAL provider に `authority` を指定して、テナントを指定しています。この指定を入れないと `authority` は `https://login.microsoftonline.com/common/` になります。アプリの登録時に登録したテナントでしか使えないアプリにしているので、サインイン時にエラーが起きてしまいます。

## 動作検証

Live Server が稼働している状態で、ブラウザーで `index.html` を表示します。リダイレクト URI として登録したときと同じように `127.0.0.1` を `localhost` に変えます (例: `http://localhost:5500/GraphToolkitTest01/index.html`)。検証用テナントで試しているときは、プライベート モードのブラウザーでアクセスしたほうがよいかもしれません。

以下のように [Sign In] ボタンが表示されます。

<img src="{% asset_path 2019122102.png %}" alt="Microsoft Graph Toolkit の Sign In ボタン">

[Sign In] をクリックするとサインイン画面が表示されるので、Office 365 のアカウントでサインインします。アクセス許可の承諾が求められたら [承諾] をクリックします。

無事にサインインできると、ユーザー名と写真が表示されます。

<img src="{% asset_path 2019122103.png %}" alt="サインイン後に表示されたユーザー名と写真">

ユーザー名をクリックするとサインアウトのリンクがあり、そこからサインアウトできます。

## Person component を使う

次に [Person component](https://learn.microsoft.com/en-us/graph/toolkit/components/person) を使います。`index.html` の `mgt-login` の下に以下の行を追加します。

```html
<mgt-person person-query="exouser02@contoso.onmicrosoft.com" show-name="true" show-email="true" person-card="hover" ></mgt-person>
```

`person-query` には、いま検証に使用しているのとは別のユーザーのメール アドレスを指定したほうが動作が分かりやすいと思います。ここでは、`person-query` に合致するユーザーの名前とメール アドレスを表示し、マウスを重ねると person card が表示されるようにしています。

`index.html` を保存すると、Live Server の自動更新機能によって画面がリフレッシュし、改めてアクセス許可の承諾を求められます。ここで承諾して進めると、以下のように `person-query` に指定したユーザーの情報が表示されます。

<img src="{% asset_path 2019122104.png %}" alt="Person component に表示されたユーザーの情報と person card">

途中で何回もアクセス許可を求められるのは面倒なので、最初のサインイン時に必要なアクセス許可をまとめて求めるようにします。`mgt-msal-provider` を以下のように変えます。

```html
<html>

<head>
    <script src="https://unpkg.com/@microsoft/mgt/dist/bundle/mgt-loader.js"></script>
</head>

<body>
    <mgt-msal-provider
        client-id="1d852daa-5f3b-4727-afde-80714fbe9577"
        authority="https://login.microsoftonline.com/contoso.onmicrosoft.com/"
        scopes="user.read,openid,profile,people.read,user.readbasic.all"></mgt-msal-provider>
    <mgt-login></mgt-login>
    <mgt-person person-query="exouser02@contoso.onmicrosoft.com" show-name="true" show-email="true" person-card="hover" ></mgt-person>
</body>

</html>
```

前のコードと比較して、`scopes` の指定が増えています。ここにあらかじめ必要なアクセス許可をまとめて記載します。何も記載しないと `user.read,openid,profile` だけになります。ここでは、Person component で他のユーザーを検索して表示するための `People.Read` と、そのユーザーの写真を表示するための `User.ReadBasic.All` を追加で指定しています。コンポーネントの各機能に必要なアクセス許可は、各コンポーネントのリファレンスに記載されています。

ブラウザーを開き直して、前とは違うユーザーでサインインしてみると、一度に複数のアクセス許可が求められます。そしてサインイン後には自分の情報と他のユーザーの情報がまとめて表示されます。

## Get component を使う

Microsoft Graph Toolkit には複数のコンポーネントが用意されていますが、最後に自由に GET リクエストを送信できる Get component を使います。さらに Template も使いながら、その中で先ほどの Person component も使います。

`index.html` を以下のような内容にします。

```html
<html>

<head>
    <script src="https://unpkg.com/@microsoft/mgt/dist/bundle/mgt-loader.js"></script>
    <style>
        table {
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid gray;
            text-align: left;
        }
    </style>
</head>

<body>
    <mgt-msal-provider client-id="1d852daa-5f3b-4727-afde-80714fbe9577"
        authority="https://login.microsoftonline.com/contoso.onmicrosoft.com/"
        scopes="user.read,openid,profile,people.read,user.readbasic.all,mail.read,contacts.read"></mgt-msal-provider>
    <mgt-login></mgt-login>
    <mgt-get resource="/me/mailfolders/inbox/messages?$select=receivedDateTime,sender,subject&$top=5" version="beta"
        scopes="mail.read" max-pages="2">
        <template>
            Loaded messages: {{value.length}}

            <div>
                <table>
                    <tr>
                        <th>Received</th>
                        <th>Sender</th>
                        <th>Subject</th>
                    </tr>
                    <tr data-for='message in value'>
                        <td>{{ message.receivedDateTime }}</td>
                        <td>
                            <mgt-person person-query='{{ message.sender.emailAddress.address }}' show-name="true"
                                show-email="true" person-card="hover"></mgt-person>
                        </td>
                        <td>{{ message.subject}}</td>
                    </tr>
                </table>
            </div>

        </template>
        <template data-type="loading">
            loading
        </template>
    </mgt-get>
</body>

</html>
```

受信トレイにあるメールを 5 通ずつ最大 2 回取得して、受信時刻と差出人と件名を表形式で表示します。`scopes` に `mail.read` と `contacts.read` を追加していますが、メールの差出人によってはさらに追加のアクセス許可が必要になるかもしれません。

うまくいくと以下のように表示されます。

<img src="{% asset_path 2019122105.png %}" alt="Get component が取得した受信メールを表形式で表示した例">

Microsoft Graph Toolkit を使うと簡単に Microsoft Graph を使用したアプリを作成できます。複雑なアプリの開発には対応できないかもしれませんが、少し Microsoft Graph で情報を取得したいというときには便利です。
