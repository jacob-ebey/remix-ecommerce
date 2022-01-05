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
    "MockCTADescription" | "MockCTAHeadline" | "MockCTALink"
  >;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let session = await getSession(request, params);
  let lang = session.getLanguage();
  let featuredProducts = await commerce.getFeaturedProducts(lang);

  return json<LoaderData>({
    featuredProducts: featuredProducts.map(
      ({ favorited, formattedPrice, id, image, slug, title }) => ({
        favorited,
        formattedPrice,
        id,
        image,
        title,
        to: `/${lang}/product/${slug}`,
      })
    ),
    translations: getTranslations(lang, [
      "MockCTADescription",
      "MockCTAHeadline",
      "MockCTALink",
    ]),
  });
};
