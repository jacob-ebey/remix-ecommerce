import { redirect } from "remix";
import type { ActionFunction, LoaderFunction } from "remix";

import commerce from "~/commerce.server";
import { getSession } from "~/session.server";

export let action: ActionFunction = async ({ request, params }) => {
  let session = await getSession(request, params);
  let lang = session.getLanguage();

  try {
    let cart = await session.getCart();
    let checkoutUrl = await commerce.getCheckoutUrl(lang, cart);

    return redirect(checkoutUrl);
  } catch (error) {
    console.error(error);
    return redirect(`/${lang}/cart`);
  }
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let session = await getSession(request, params);
  let lang = session.getLanguage();
  return redirect(`/${lang}/cart`);
};
