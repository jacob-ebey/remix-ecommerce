import { json, redirect } from "remix";
import type { ActionFunction, HeadersFunction, LoaderFunction } from "remix";

import commerce from "~/commerce.server";
import { addToCart, getSession } from "~/session.server";
import { getTranslations } from "~/translations.server";
import type { PickTranslations } from "~/translations.server";
import type { FullProduct } from "~/models/ecommerce-provider.server";
import { validateRedirect } from "~/utils/redirect.server";

export let headers: HeadersFunction = ({ actionHeaders }) => {
  return actionHeaders;
};

export let action: ActionFunction = async ({ request, params }) => {
  let [body, session] = await Promise.all([
    request.text(),
    getSession(request, params),
  ]);
  let formData = new URLSearchParams(body);
  let redirectTo = validateRedirect(
    formData.get("redirect"),
    `/product/${params.slug}`
  );
  let variantId = formData.get("variantId");
  if (!variantId) {
    return redirect(redirectTo);
  }

  let cart = await session.getCart();
  cart = addToCart(cart, variantId, 1);
  await session.setCart(cart);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await session.commitSession(),
    },
  });
};

export type LoaderData = {
  product: FullProduct;
  translations: PickTranslations<"Add to cart" | "Sold out">;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let url = new URL(request.url);

  let slug = params.slug?.trim();
  if (!slug) {
    throw json("Product not found", { status: 404 });
  }

  let selectedOptions = Array.from(url.searchParams.entries()).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  let session = await getSession(request, params);
  let lang = session.getLanguage();
  let product = await commerce.getProduct(lang, slug, selectedOptions);

  if (!product) {
    throw json(`Product "${slug}" not found`, { status: 404 });
  }

  return json<LoaderData>({
    product,
    translations: getTranslations(lang, ["Add to cart", "Sold out"]),
  });
};
