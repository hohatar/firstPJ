// Astroの設定関数を読み込む。
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

// 静的HTMLを出力するAstro設定を公開する。
export default defineConfig({
  // サーバー実行環境を使わない静的出力を指定する。
  output: "static",

  adapter: cloudflare(),
});