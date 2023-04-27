import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { To } from "react-router-dom";

import commerce from "~/commerce.server";
import { getSession } from "~/session.server";
import { getTranslations } from "~/translations.server";

type CDPProduct = {
  id: string;
  title: string;
  formattedPrice: string;
  favorited: boolean;
  image: string;
  to: To;
  defaultVariantId: string;
};

function time<T>(label: string) {
  // console.time(label);
  return (r: T) => {
    // console.timeEnd(label);
    return r;
  };
}

export async function loader({ request, params }: LoaderArgs) {
  console.time("get session");
  let session = await getSession(request, params);
  console.timeEnd("get session");
  let lang = session.getLanguage();
  let url = new URL(request.url);

  let category = url.searchParams.get("category") || undefined;
  let sort = url.searchParams.get("sort") || undefined;
  let search = url.searchParams.get("q") || undefined;
  let cursor = url.searchParams.get("cursor") || undefined;
  let nocache = url.searchParams.has("nocache");

  let [categories, sortByOptions, productsPage, wishlist] = await Promise.all([
    commerce.getCategories(lang, 250, nocache).then(time("get categories")),
    commerce.getSortByOptions(lang).then(time("get sort by options")),
    commerce
      .getProducts(lang, category, sort, search, cursor, 30, nocache)
      .then(time("get products page")),
    session.getWishlist().then(time("get wishlist")),
  ]);

  let wishlistHasProduct = new Set(
    wishlist.map<string>((item) => item.productId)
  );

  let translations = getTranslations(lang, [
    "Add to wishlist",
    "Remove from wishlist",
  ]);

  return json({
    category,
    sort,
    categories,
    search,
    sortByOptions,
    hasNextPage: productsPage.hasNextPage,
    nextPageCursor: productsPage.nextPageCursor,
    products: productsPage.products.map<CDPProduct>((product) => ({
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
}
