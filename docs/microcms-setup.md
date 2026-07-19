# microCMS設定手順

## 方針

1つのコンテンツに中国語・日本語・英語のフィールドを持たせる。型番、画像、PDF、公開状態は言語共通で管理する。

## 作成するAPI

| API ID | 形式 | 用途 |
| --- | --- | --- |
| `site-settings` | オブジェクト | 会社名、連絡先、フッター、SNS。 |
| `company-profile` | オブジェクト | 会社紹介・技術紹介の各言語本文。 |
| `product-categories` | リスト | 製品カテゴリ。 |
| `products` | リスト | 製品一覧・製品詳細。 |
| `news` | リスト | お知らせ。初回公開で不要なら後から作成する。 |

## 言語フィールド

- `Zh`：現行サイトから移行する中国語。
- `Ja`：日本語。
- `En`：英語。
- すべての公開ページは、対応言語の必須フィールドが入力済みの場合だけ公開する。
- 型番、画像、PDF、カテゴリ参照、表示順、旧サイトIDは共通フィールドにする。
- 公開・非公開はmicroCMSのコンテンツ公開ステータスで管理し、独自フラグは使わない。

## 現在のAstro連携

- `MICROCMS_SERVICE_DOMAIN`と`MICROCMS_API_KEY`をローカルの`.env`およびCloudflare Pagesの環境変数へ設定する。
- Astroはビルド時に`product-categories`と`products`を取得し、中国語（ルート直下）、日本語（`/ja/`）、英語（`/en/`）の一覧・詳細を静的生成する。`/zh/`配下は中国語の互換URLとして同じコンテンツを生成する。
- `products.category`を設定すると製品一覧をカテゴリで絞り込める。`summaryZh` / `summaryJa` / `summaryEn`、`bodyZh` / `bodyJa` / `bodyEn`、`thumbnail`を設定すると、製品詳細ページに概要・本文・画像を表示する。未翻訳の本文は中国語を代替表示する。

## CSVの使い方

- `legacy-migration-categories.csv` をカテゴリ移行台帳として使う。
- `legacy-migration-products.csv` を製品移行台帳として使う。
- `legacy-migration-pages.csv` を会社紹介・連絡先の移行台帳として使う。
- microCMSへの登録は、CSVの内容を確認してから管理画面で行う。
- `name_ja` と `name_en` が空欄の行は、翻訳と事業承認後に入力する。
- 旧サイトURLと画像URLは検証用であり、公開サイトから直接参照しない。
