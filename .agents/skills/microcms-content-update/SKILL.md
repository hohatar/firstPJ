---
name: microcms-content-update
description: このリポジトリにおけるmicroCMSコンテンツモデルとAstro静的コンテンツの変更を計画または実装する。microCMS API、コンテンツ項目、コンテンツ取得、Webhookによるビルド、編集者向け文書を追加または変更するときに使用する。
---

# microCMSコンテンツ更新

1. `AGENTS.md`、`docs/architecture.md`、`docs/content-model.md`を読む。
2. 依頼が公開コンテンツ、microCMS項目、Astroの取得処理、編集者手順のどれを変更するか特定する。
3. モデルは最小限に保ち、確認済みのページ要件がない限りネスト項目を避ける。
4. APIキーはサーバー側かつビルド時のみに限定する。
5. コンテンツモデルを変更した場合は、`docs/content-model.md`と`docs/admin-guide.md`を更新する。
6. 実装する場合は、HTML以外のプログラミング行すべてに日本語注釈を付ける。
7. 静的ビルドの挙動を確認し、未設定の外部依存関係を報告する。
