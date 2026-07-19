# 製品カテゴリ絞り込み

製品一覧の先頭には「ALL」と各カテゴリを表示する。選択されたカテゴリに属する製品だけを、公開済みの静的HTML内で表示する。

microCMSの`products.category`（`product-categories`への参照）が設定されている場合は、そのカテゴリslugを最優先する。カテゴリ参照が未設定の既存製品に限り、移行台帳の`legacyProductId`と`legacyCategoryId`の対応をビルド時だけにフォールバックとして使用する。

編集者は、microCMSで各製品の`category`参照を設定する。全製品で設定が完了すれば、移行台帳へのフォールバックには依存しない。
