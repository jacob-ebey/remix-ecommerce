import type { Language } from "./language";

export interface CartItem {
  variantId: string;
  quantity: number;
}

export interface FullCartItem extends CartItem {
  info: Product;
}

export interface CartInfo {
  formattedTaxes: string;
  formattedTotal: string;
  formattedShipping: string;
  formattedSubTotal: string;
  items: FullCartItem[];
}

export interface WishlistItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface FullWishlistItem extends WishlistItem {
  info: Product;
}

export interface Category {
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  title: string;
  formattedPrice: string;
  formattedOptions?: string;
  image: string;
  slug: string;
  defaultVariantId: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface FullProduct extends Product {
  description?: string;
  descriptionHtml?: string;
  images: string[];
  availableForSale: boolean;
  selectedVariantId?: string;
  options: ProductOption[];
}

export interface Page {
  id: string;
  slug: string;
  title: string;
}

export interface FullPage extends Page {
  body: string;
  summary: string;
}

export interface SortByOption {
  label: string;
  value: string;
}

export interface SelectedProductOption {
  name: string;
  value: string;
}

export interface ProductsResult {
  hasNextPage: boolean;
  nextPageCursor?: string;
  products: Product[];
}

export interface EcommerceProvider {
  getCartInfo(
    locale: Language,
    items: CartItem[]
  ): Promise<CartInfo | undefined>;
  getCategories(
    language: Language,
    count: number,
    nocache?: boolean
  ): Promise<Category[]>;
  getCheckoutUrl(language: Language, items: CartItem[]): Promise<string>;
  getFeaturedProducts(language: Language): Promise<Product[]>;
  getPage(language: Language, slug: string): Promise<FullPage | undefined>;
  getPages(language: Language): Promise<Page[]>;
  getProduct(
    language: Language,
    slug: string,
    selectedOptions?: SelectedProductOption[]
  ): Promise<FullProduct | undefined>;
  getProducts(
    language: Language,
    category?: string,
    sort?: string,
    search?: string,
    cursor?: string,
    perPage?: number,
    nocache?: boolean
  ): Promise<ProductsResult>;
  getSortByOptions(language: Language): Promise<SortByOption[]>;
  getWishlistInfo(
    locale: Language,
    items: WishlistItem[]
  ): Promise<FullWishlistItem[] | undefined>;
}
