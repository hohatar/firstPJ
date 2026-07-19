// 対応する公開言語を定義する。
// 既存製品とカテゴリの移行対応表をビルド時だけに読み込む。
import legacyProductCategoryCsv from "../../docs/legacy-migration-products.csv?raw";

export type SiteLanguage = "ja" | "zh" | "en";

// microCMSの製品カテゴリ返却形式を定義する。
type MicrocmsCategory = {
  // microCMSコンテンツIDを定義する。
  id: string;
  // URL用の識別子を定義する。
  slug: string;
  // 表示順を定義する。
  displayOrder: number;
  // 既存サイトのカテゴリIDを任意で保持する。
  legacyCategoryId?: number;
  // 中国語のカテゴリ名を定義する。
  nameZh: string;
  // 日本語のカテゴリ名を定義する。
  nameJa: string;
  // 英語のカテゴリ名を定義する。
  nameEn: string;
  // microCMSに登録したカテゴリ画像を定義する。
  image?: { url: string };
};

// microCMSの製品返却形式を定義する。
type MicrocmsProduct = {
  // microCMSコンテンツIDを定義する。
  id: string;
  // URL用の識別子を定義する。
  slug: string;
  // 既存サイトの製品IDを保持する。
  legacyProductId?: number;
  // 製品の型番を定義する。
  modelNumber: string;
  // microCMSで設定されたカテゴリ参照を任意で保持する。
  category?: { slug?: string };
  // 表示順を定義する。
  displayOrder: number;
  // 中国語の製品名を定義する。
  nameZh: string;
  // 日本語の製品名を定義する。
  nameJa: string;
  // 英語の製品名を定義する。
  nameEn: string;
};

// microCMSのリスト形式レスポンスを定義する。
type MicrocmsListResponse<T> = {
  // コンテンツ総数を定義する。
  totalCount: number;
  // コンテンツ配列を定義する。
  contents: T[];
};

// サイト表示に使うカテゴリ形式を定義する。
export type CatalogCategory = {
  // URL用の識別子を定義する。
  slug: string;
  // 表示順を定義する。
  displayOrder: number;
  // 言語に応じたカテゴリ名を定義する。
  name: string;
  // カテゴリカードに表示する画像URLを定義する。
  imageUrl?: string;
};

// サイト表示に使う製品形式を定義する。
export type CatalogProduct = {
  // URL用の識別子を定義する。
  slug: string;
  // 型番を定義する。
  modelNumber: string;
  // 表示順を定義する。
  displayOrder: number;
  // 言語に応じた製品名を定義する。
  name: string;
  // 製品一覧の絞り込みに使うカテゴリのslugを定義する。
  categorySlug?: string;
};

// 既存製品IDから既存カテゴリIDを引けるよう移行台帳を変換する。
const legacyCategoryIdByProductId = new Map(legacyProductCategoryCsv.trim().split(/\r?\n/).slice(1).map((row) => {
  // CSVの先頭二列だけを製品IDとカテゴリIDとして取り出す。
  const [legacyProductId, legacyCategoryId] = row.split(",", 3);
  // 数値へ変換した対応関係を返す。
  return [Number(legacyProductId), Number(legacyCategoryId)] as const;
}));

// ビルド中に同じAPIを繰り返し呼ばないためのキャッシュを定義する。
let catalogPromise: Promise<{ categories: MicrocmsCategory[]; products: MicrocmsProduct[] }> | undefined;

// 言語に対応するフィールド名を返す。
function localizedName(content: { nameZh: string; nameJa: string; nameEn: string }, language: SiteLanguage) {
  // 中国語の表示名を返す。
  if (language === "zh") return content.nameZh;
  // 英語の表示名を返す。
  if (language === "en") return content.nameEn;
  // 日本語の表示名を返す。
  return content.nameJa;
}

// CMS参照を優先し、未設定の既存データだけ移行台帳からカテゴリslugを解決する。
function categorySlugForProduct(product: MicrocmsProduct, categories: MicrocmsCategory[]) {
  // CMSにカテゴリslugがある場合はその値を使う。
  if (product.category?.slug) return product.category.slug;
  // 既存製品IDから既存カテゴリIDを取得する。
  const legacyCategoryId = product.legacyProductId ? legacyCategoryIdByProductId.get(product.legacyProductId) : undefined;
  // 既存カテゴリIDがない場合は未分類として扱う。
  if (!legacyCategoryId) return undefined;
  // CMSカテゴリのslugへ変換する。
  return categories.find((category) => category.legacyCategoryId === legacyCategoryId)?.slug;
}

// 必須のmicroCMS環境変数を検証する。
function getMicrocmsConfiguration() {
  // Astroの環境変数またはCloudflareのNode.js環境変数からサービスドメインを取得する。
  const serviceDomain = import.meta.env.MICROCMS_SERVICE_DOMAIN || process.env.MICROCMS_SERVICE_DOMAIN;
  // Astroの環境変数またはCloudflareのNode.js環境変数から読み取り専用APIキーを取得する。
  const apiKey = import.meta.env.MICROCMS_API_KEY || process.env.MICROCMS_API_KEY;
  // 未設定のままビルドしないようにする。
  if (!serviceDomain || !apiKey) throw new Error("MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY を設定してください。");
  // 接続設定を返す。
  return { serviceDomain, apiKey };
}

// microCMSのリスト形式APIをビルド時に取得する。
async function getList<T>(endpoint: string) {
  // 接続設定を取得する。
  const { serviceDomain, apiKey } = getMicrocmsConfiguration();
  // 公開済みコンテンツを最大100件取得する。
  const response = await fetch(`https://${serviceDomain}.microcms.io/api/v1/${endpoint}?limit=100`, {
    // APIキーはビルド時のHTTPヘッダーだけで送る。
    headers: { "X-MICROCMS-API-KEY": apiKey },
  });
  // 失敗時はエンドポイントを含む安全なエラーにする。
  if (!response.ok) throw new Error(`microCMSの${endpoint}取得に失敗しました: HTTP ${response.status}`);
  // JSONレスポンスを返す。
  return response.json() as Promise<MicrocmsListResponse<T>>;
}

// カテゴリと製品を一度だけ取得する。
async function getCatalogSource() {
  // 既存の取得処理があれば再利用する。
  if (catalogPromise) return catalogPromise;
  // カテゴリと製品を並列に取得してキャッシュする。
  catalogPromise = Promise.all([getList<MicrocmsCategory>("product-categories"), getList<MicrocmsProduct>("products")]).then(([categoryResponse, productResponse]) => ({
    // 表示順でカテゴリを整列する。
    categories: [...categoryResponse.contents].sort((left, right) => left.displayOrder - right.displayOrder),
    // 表示順で製品を整列する。
    products: [...productResponse.contents].sort((left, right) => left.displayOrder - right.displayOrder),
  }));
  // 取得結果を返す。
  return catalogPromise;
}

// 指定言語のカテゴリと製品をサイト表示形式へ変換する。
export async function getCatalog(language: SiteLanguage) {
  // microCMSの原データを取得する。
  const source = await getCatalogSource();
  // 表示用データを返す。
  return {
    // 言語別のカテゴリ名へ変換する。
    // microCMSに登録されたカテゴリ画像を表示用データへ引き継ぐ。
    categories: source.categories.map((category) => ({ slug: category.slug, displayOrder: category.displayOrder, name: localizedName(category, language), imageUrl: category.image?.url })),
    // 言語別の製品名へ変換する。
    // 言語別の製品名とカテゴリslugへ変換する。
    products: source.products.map((product) => ({ slug: product.slug, modelNumber: product.modelNumber, displayOrder: product.displayOrder, name: localizedName(product, language), categorySlug: categorySlugForProduct(product, source.categories) })),
  };
}
