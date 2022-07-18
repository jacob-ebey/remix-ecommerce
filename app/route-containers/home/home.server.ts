import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import commerce from "~/commerce.server";
import { getTranslations } from "~/translations.server";
import { getSession } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  let session = await getSession(request, params);
  let lang = session.getLanguage();
  let [featuredProducts, wishlist] = await Promise.all([
    commerce.getFeaturedProducts(lang),
    session.getWishlist(),
  ]);

  let wishlistHasProduct = new Set(
    wishlist.map<string>((item) => item.productId)
  );

  return json({
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
}
