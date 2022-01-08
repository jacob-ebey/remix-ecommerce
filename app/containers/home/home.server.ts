import type { LoaderFunction } from "remix";
import { json } from "remix";

import commerce from "~/commerce.server";
import { getTranslations } from "~/translations.server";
import type { PickTranslations } from "~/translations.server";
import { getSession } from "~/session.server";

import type { ThreeProductGridProduct } from "~/components/three-product-grid";

export type LoaderData = {
  featuredProducts: ThreeProductGridProduct[];
  translations: PickTranslations<
    | "MockCTADescription"
    | "MockCTAHeadline"
    | "MockCTALink"
    | "Add to wishlist"
    | "Remove from wishlist"
  >;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let session = await getSession(request, params);
  let lang = session.getLanguage();
  let [featuredProducts, wishlist] = await Promise.all([
    commerce.getFeaturedProducts(lang),
    session.getWishlist(),
  ]);

  let wishlistHasProduct = new Set(
    wishlist.map<string>((item) => item.productId)
  );

  return json<LoaderData>({
    featuredProducts: featuredProducts.map(
      ({ formattedPrice, id, image, slug, title, defaultVariantId }) => ({
        favorited: wishlistHasProduct.has(id),
        formattedPrice,
        id,
        defaultVariantId,
        image,
        title,
        to: `/${lang}/product/${slug}`,
      })
    ),
    translations: getTranslations(lang, [
      "MockCTADescription",
      "MockCTAHeadline",
      "MockCTALink",
      "Add to wishlist",
      "Remove from wishlist",
    ]),
  });
};
