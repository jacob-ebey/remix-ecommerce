import { json } from "remix";
import type { LoaderFunction } from "remix";
import type { To } from "react-router-dom";

import type {
  Category,
  SortByOption,
} from "~/models/ecommerce-provider.server";
import commerce from "~/commerce.server";
import { getSession } from "~/session.server";
import { getTranslations } from "~/translations.server";
import type { PickTranslations } from "~/translations.server";

export type CDPProduct = {
  id: string;
  title: string;
  formattedPrice: string;
  favorited: boolean;
  image: string;
  to: To;
  defaultVariantId: string;
};

export type LoaderData = {
  category?: string;
  sort?: string;
  categories: Category[];
  search?: string;
  sortByOptions: SortByOption[];
  products: CDPProduct[];
  hasNextPage: boolean;
  nextPageCursor?: string;
  translations: PickTranslations<"Add to wishlist" | "Remove from wishlist">;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let session = await getSession(request, params);
  let lang = session.getLanguage();
  let url = new URL(request.url);

  let category = url.searchParams.get("category") || undefined;
  let sort = url.searchParams.get("sort") || undefined;
  let search = url.searchParams.get("q") || undefined;
  let cursor = url.searchParams.get("cursor") || undefined;
  let nocache = url.searchParams.has("nocache");

  let [categories, sortByOptions, productsPage, wishlist] = await Promise.all([
    commerce.getCategories(lang, 250, nocache),
    commerce.getSortByOptions(lang),
    commerce.getProducts(lang, category, sort, search, cursor, 30, nocache),
    session.getWishlist(),
  ]);

  let wishlistHasProduct = new Set(
    wishlist.map<string>((item) => item.productId)
  );

  let translations = getTranslations(lang, [
    "Add to wishlist",
    "Remove from wishlist",
  ]);

  return json<LoaderData>({
    category,
    sort,
    categories,
    search,
    sortByOptions,
    hasNextPage: productsPage.hasNextPage,
    nextPageCursor: productsPage.nextPageCursor,
    products: productsPage.products.map((product) => ({
      favorited: wishlistHasProduct.has(product.id),
      formattedPrice: product.formattedPrice,
      id: product.id,
      image: product.image,
      title: product.title,
      to: `/${lang}/product/${product.slug}`,
      defaultVariantId: product.defaultVariantId,
    })),
    translations,
  });
};
