---
title: Sending a digitally signed email from .NET Framework
date: 2015-10-11T17:24:12+09:00
updated: 2026-09-03T18:37:17+09:00
lang: en
slug: send-signed-email-dotnet-framework
categories:
  - .NET
tags:
  - .NET
  - SmtpClient
description: SmtpClient in .NET Framework has no built-in way to digitally sign or encrypt a message, so this post builds the S/MIME MIME data by hand to send a digitally signed email.
---

> [!NOTE]
> The [SmtpClient](https://learn.microsoft.com/en-us/dotnet/api/system.net.mail.smtpclient) class used in this article is no longer recommended for new development. See the remarks section of the SmtpClient class reference for details. For new development, consider a library such as [MailKit](https://github.com/jstedfast/MailKit) instead.

When you send email from .NET Framework, you would normally use SmtpClient. But SmtpClient has no property or simple option to digitally sign or encrypt a message. Because of that, this topic has been discussed on forums and blogs, and some third-party products are sold to fill the gap.

> [!NOTE]
> When this article was originally written, it linked to a forum thread and a blog post about this topic. Both pages are no longer available, so this article no longer links to them.

Both the forum and the blog I found did not seem to consider Japanese text, so I wrote my own version that handles it. I show the full code at the end, but please use it at your own risk. It mostly reuses the existing SmtpClient, so it is not perfect. The code is patched together and has no exception handling.

First, handling Japanese text requires specifying a character encoding and encoding the string, so let's create a class that Base64-encodes a string using the specified character encoding. Because a MIME header needs to indicate its character encoding, I provide two functions: a plain `Encode`, and `EncodeWithCharecterCode`, which also includes the character encoding name. You can use encodings such as iso-2022-jp or UTF-8.

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

Now, let's build the message. Since this cannot be done with the standard SmtpClient features alone, we need to build the MIME data ourselves. First is the pattern with no attachments. The MIME data is built as follows.

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

This is already getting tedious, but now let's handle the case where there are attachments. This becomes a multi-part MIME message. The body part is mostly the same as before, so I won't repeat it here. I've omitted the variable declarations, but the attachment data is built as follows, repeated once per attachment.

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

Once the MIME data is ready, sign it. I'll show how to select the certificate to use later.

```csharp
byte[] Data = Encoding.ASCII.GetBytes(MimePart);
ContentInfo Content = new ContentInfo(Data);
SignedCms SignedCms = new SignedCms(Content, false);
CmsSigner Signer = new CmsSigner(SubjectIdentifierType.IssuerAndSerialNumber, Certificate);
SignedCms.ComputeSignature(Signer);
byte[] SignedBytes = SignedCms.Encode();
```

After signing, set it on the MailMessage's AlternateViews.

```csharp
MemoryStream Stream = new MemoryStream(SignedBytes);
AlternateView View = new AlternateView(Stream, "application/pkcs7-mime; smime-type=signed-data;name=smime.p7m");
Message.AlternateViews.Add(View);
```

Finally, send it with SmtpClient and you're done.

```csharp
SmtpClient Client = new SmtpClient("192.168.1.1", 25);
Client.UseDefaultCredentials = true;
Client.Send(Message);
```

For the signing certificate, you can either select it from the certificate store or load it from a file. Selecting it from the certificate store looks something like this.

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

If you load it from a certificate file that includes the private key, it looks like this.

```csharp
Certificate = new X509Certificate2("C:\cert.pfx", "password");
```

That covers the individual pieces. Finally, here is the full sample code.

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

As you'll notice if you test this in various ways, this code is not perfect. For example, it doesn't check the size of each line, and Outlook shows an attachment icon on the received message even when there are no attachments. To make it truly robust, you would need to implement the SMTP behavior yourself, on top of classes such as SmtpClient and MailMessage.
