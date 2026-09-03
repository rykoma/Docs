---
title: .NET Framework で電子署名付きのメールを送信する
date: 2015-10-11T17:24:12+09:00
updated: 2026-09-03T18:37:17+09:00
lang: ja
slug: send-signed-email-dotnet-framework
categories:
  - .NET
tags:
  - .NET
  - SmtpClient
description: .NET Framework の SmtpClient には電子署名や暗号化の機能が用意されていないため、S/MIME 形式の MIME データを自前で組み立てて電子署名付きメールを送信するサンプル コードを紹介します。
alias:
  - /2015/10/11/55/
---

> [!NOTE]
> この記事で紹介している [SmtpClient](https://learn.microsoft.com/ja-jp/dotnet/api/system.net.mail.smtpclient) クラスは、現在は新規開発での使用が推奨されていません。詳細は SmtpClient クラスのリファレンスの解説を参照してください。新規開発では [MailKit](https://github.com/jstedfast/MailKit) などのライブラリの使用を検討してください。

.NET Framework でメールを送信するときは SmtpClient を使うことになると思いますが、プロパティなどで簡単にメールに電子署名をつけたり暗号化したりすることはできません。そのため、フォーラムやブログで議論されたり、3rd パーティ製品も販売されたりもしているようです。

> [!NOTE]
> 執筆当時は、この話題を扱うフォーラムの投稿や関連ブログ記事へのリンクを掲載していましたが、いずれも公開が終了しているため、本記事ではリンクを外しています。

先のフォーラムもブログも日本語を考慮していないようでしたので、日本語を扱えるように書いてみました。最後に全文を紹介しますが、実行は自己責任でお願いします。なるべく既存の SmtpClient を使用するため完ぺきではないですし、つぎはぎで書いており、例外処理もしていません。

まず初めに、日本語を扱うには文字コードの指定とエンコードが必要となるので、指定した文字コードの文字列を Base64 でエンコードするクラスを作成しておきます。MIME ヘッダーに使用するときは文字コードを示す必要があるので、単純にエンコードをする Encode と、EncodeWithCharecterCode の 2 つの関数を用意します。文字コードには iso-2022-jp や UTF-8 が使用できます。

```csharp
public class MyBase64str
{
	private Encoding enc;
	private string characterCode;

	public MyBase64str(string CharacterCode)
	{
		enc = Encoding.GetEncoding(CharacterCode);
		characterCode = CharacterCode;
	}

	public string Encode(string str)
	{
		return Convert.ToBase64String(enc.GetBytes(str));
	}

	public string EncodeWithCharecterCode(string str)
	{
		return "?" + characterCode + "?B?" + Convert.ToBase64String(enc.GetBytes(str)) + "?=";
	}
}
```

それでは、さっそくメールを作っていきます。標準機能では実現できないので、MIME データを作る必要があります。まずは添付ファイルがない場合のパターンです。以下のような形で、MIME データを作ります。

```csharp
StringBuilder buffer = new StringBuilder();
string MimePart;

buffer.Append("MIME-Version: 1.0\r\n");

if (IsBodyHtml)
{
	buffer.Append("Content-Type: text/html; charset=\"UTF-8\"\r\n");
}
else
{
	buffer.Append("Content-Type: text/plain; charset=\"UTF-8\"\r\n");
}

buffer.Append("Content-Transfer-Encoding: base64\r\n\r\n");
buffer.Append(Base64.Encode(Body));

MimePart = buffer.ToString();
```

もうすでに面倒ですが、今度は添付ファイルがある場合です。マルチ パートの MIME データになります。本文部分は大体同じなので紹介しません。変数の宣言部分を省略していますが、添付ファイルのデータを以下のように作ります。これを添付ファイルの回数だけ繰り返します。

```csharp
FileInfo FileInfo = new FileInfo(FileName);
buffer.Append("--unique-boundary-1\r\n");
buffer.Append("Content-Type: application/octet-stream; file="=" + Base64.EncodeWithCharecterCode(FileInfo.Name) + ""\r\n");
buffer.Append("Content-Transfer-Encoding: base64\r\n");
buffer.Append("Content-Disposition: attachment; filename="=" + Base64.EncodeWithCharecterCode(FileInfo.Name) + ""\r\n");
buffer.Append("\r\n");
byte[] BinaryData = File.ReadAllBytes(FileInfo.FullName);

string Base64Value = Convert.ToBase64String(BinaryData, 0, BinaryData.Length);
int Position = 0;
while (Position < Base64Value.Length)
{
	int ChunkSize = 100;
	if (Base64Value.Length - (Position + ChunkSize) < 0)
		ChunkSize = Base64Value.Length - Position;
		buffer.Append(Base64Value.Substring(Position, ChunkSize));
		buffer.Append("\r\n");
		Position += ChunkSize;
	}
buffer.Append("\r\n");
```

MIME データが生成できたら署名します。使用する証明書の選択方法はのちほど紹介します。

```csharp
byte[] Data = Encoding.ASCII.GetBytes(MimePart);
ContentInfo Content = new ContentInfo(Data);
SignedCms SignedCms = new SignedCms(Content, false);
CmsSigner Signer = new CmsSigner(SubjectIdentifierType.IssuerAndSerialNumber, Certificate);
SignedCms.ComputeSignature(Signer);
byte[] SignedBytes = SignedCms.Encode();
```

署名したら、MailMessage の AlternateViews に設定します。

```csharp
MemoryStream Stream = new MemoryStream(SignedBytes);
AlternateView View = new AlternateView(Stream, "application/pkcs7-mime; smime-type=signed-data;name=smime.p7m");
Message.AlternateViews.Add(View);
```

最後に、SmtpClient で送信して完了です。

```csharp
SmtpClient Client = new SmtpClient("192.168.1.1", 25);
Client.UseDefaultCredentials = true;
Client.Send(Message);
```

署名に使用する証明書は、証明書ストアから選択するか、ファイルから読み込みます。証明書ストアから選択するのであれば、例えば以下のようになります。

```csharp
X509Store Store = new X509Store(StoreLocation.CurrentUser);
Store.Open(OpenFlags.OpenExistingOnly | OpenFlags.ReadOnly);
X509Certificate2Collection Certs = Store.Certificates;
                
foreach (X509Certificate2 Cert in Certs)
{
	if (Cert.Subject.IndexOf("user01") >= 0)
	{
		Certificate = Cert;
		break;
	}
}
```

秘密鍵を含む証明書ファイルから読み込む場合は以下のようになります。

```csharp
Certificate = new X509Certificate2("C:\cert.pfx", "password");
```

個別の説明は以上です。最後にサンプル コード全文を紹介します。

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Security.Cryptography.Pkcs;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace MyProgram
{
    class Program
    {
        static void Main(string[] args)
        {
            bool LoadCertificateFromStore = true;
            X509Certificate2 Certificate = null;

            if (LoadCertificateFromStore)
            {
                X509Store Store = new X509Store(StoreLocation.CurrentUser);
                Store.Open(OpenFlags.OpenExistingOnly | OpenFlags.ReadOnly);
                X509Certificate2Collection Certs = Store.Certificates;
                
                foreach (X509Certificate2 Cert in Certs)
                {
                    if (Cert.Subject.IndexOf("user01") >= 0)
                    {
                        Certificate = Cert;
                        break;
                    }
                }
            }
            else
            {
                Certificate = new X509Certificate2("C:\cert.pfx", "password");
            }


            MailAddress[] To = { new MailAddress("user02@contoso.com") };
            MailAddress From = new MailAddress("user01@contoso.com");
            string Subject = "電子署名付きメール";
            string Body = @"<html><body><p>このメールは<b>電子署名つき</b>です。</p></body></html>";
            string[] Attachments = { @"C:テスト1.txt", @"C:テスト2.txt" };

            SendEncryptedEmail(To, From, Subject, Body, Certificate, Attachments, true, "UTF-8");
        }

        public static void SendEncryptedEmail(MailAddress[] To, MailAddress From, string Subject, string Body, X509Certificate2 Certificate, string[] Attachments, bool IsBodyHtml, string CharacterCode)
        {
            MyBase64str Base64 = new MyBase64str(CharacterCode);

            MailMessage Message = new MailMessage();
            foreach (MailAddress Address in To)
            {
                Message.To.Add(Address);
            }
            Message.From = From;
            Message.Subject = Subject;

            StringBuilder buffer = new StringBuilder();
            string MimePart;

            if (Attachments != null && Attachments.Length > 0)
            {
                buffer.Append("MIME-Version: 1.0\r\n");
                buffer.Append("Content-Type: multipart/mixed; boundary=unique-boundary-1\r\n");
                buffer.Append("\r\n");
                buffer.Append("This is a multi-part message in MIME format.\r\n");
                buffer.Append("--unique-boundary-1\r\n");

                if (IsBodyHtml)
                {
                    buffer.Append("Content-Type: text/html; charset="" + CharacterCode + ""\r\n");
                }
                else
                {
                    buffer.Append("Content-Type: text/plain; charset="" + CharacterCode + ""\r\n");
                }

                buffer.Append("Content-Transfer-Encoding: base64\r\n\r\n");
                buffer.Append(Base64.Encode(Body));

                if (!Body.EndsWith("\r\n"))
                    buffer.Append("\r\n");
                buffer.Append("\r\n\r\n");

                foreach (string FileName in Attachments)
                {
                    FileInfo FileInfo = new FileInfo(FileName);
                    buffer.Append("--unique-boundary-1\r\n");
                    buffer.Append("Content-Type: application/octet-stream; file="=" + Base64.EncodeWithCharecterCode(FileInfo.Name) + ""\r\n");
                    buffer.Append("Content-Transfer-Encoding: base64\r\n");
                    buffer.Append("Content-Disposition: attachment; filename="=" + Base64.EncodeWithCharecterCode(FileInfo.Name) + ""\r\n");
                    buffer.Append("\r\n");
                    byte[] BinaryData = File.ReadAllBytes(FileInfo.FullName);

                    string Base64Value = Convert.ToBase64String(BinaryData, 0, BinaryData.Length);
                    int Position = 0;
                    while (Position < Base64Value.Length)
                    {
                        int ChunkSize = 100;
                        if (Base64Value.Length - (Position + ChunkSize) < 0)
                            ChunkSize = Base64Value.Length - Position;
                        buffer.Append(Base64Value.Substring(Position, ChunkSize));
                        buffer.Append("\r\n");
                        Position += ChunkSize;
                    }
                    buffer.Append("\r\n");
                }

                MimePart = buffer.ToString();
            }
            else
            {
                buffer.Append("MIME-Version: 1.0\r\n");

                if (IsBodyHtml)
                {
                    buffer.Append("Content-Type: text/html; charset="" + CharacterCode + ""\r\n");
                }
                else
                {
                    buffer.Append("Content-Type: text/plain; charset="" + CharacterCode + ""\r\n");
                }

                buffer.Append("Content-Transfer-Encoding: base64\r\n\r\n");
                buffer.Append(Base64.Encode(Body));

                MimePart = buffer.ToString();
            }

            byte[] Data = Encoding.ASCII.GetBytes(MimePart);
            ContentInfo Content = new ContentInfo(Data);
            SignedCms SignedCms = new SignedCms(Content, false);
            CmsSigner Signer = new CmsSigner(SubjectIdentifierType.IssuerAndSerialNumber, Certificate);
            SignedCms.ComputeSignature(Signer);
            byte[] SignedBytes = SignedCms.Encode();

            MemoryStream Stream = new MemoryStream(SignedBytes);
            AlternateView View = new AlternateView(Stream, "application/pkcs7-mime; smime-type=signed-data;name=smime.p7m");
            Message.AlternateViews.Add(View);

            SmtpClient Client = new SmtpClient("192.168.1.244", 25);
            Client.UseDefaultCredentials = true;
            Client.Send(Message);
        }
    }

    public class MyBase64str
    {
        private Encoding enc;
        private string characterCode;

        public MyBase64str(string CharacterCode)
        {
            enc = Encoding.GetEncoding(CharacterCode);
            characterCode = CharacterCode;
        }

        public string Encode(string str)
        {
            return Convert.ToBase64String(enc.GetBytes(str));
        }

        public string EncodeWithCharecterCode(string str)
        {
            return "?" + characterCode + "?B?" + Convert.ToBase64String(enc.GetBytes(str)) + "?=";
        }
    }
}
```

なお、色々とテストしていただくと分かりますが、このコードは完ぺきではありません。1 行のサイズをチェックしていなかったり、受信したメールを Outlook で表示すると添付ファイルがなくても添付ファイルのアイコンが表示されたりします。完ぺきを目指すのであれば、SmtpClient や MailMessage などのクラスをベースに、SMTP の機能を自前で実装する必要がありそうです。
