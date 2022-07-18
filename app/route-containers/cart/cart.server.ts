import type { ActionArgs, HeadersFunction, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { updateCartItem, removeCartItem, getSession } from "~/session.server";
import { getTranslations } from "~/translations.server";
import commerce from "~/commerce.server";
import { validateRedirect } from "~/utils/redirect.server";

export let headers: HeadersFunction = ({ actionHeaders }) => {
  return actionHeaders;
};

export async function action({ request, params }: ActionArgs) {
  let [body, session] = await Promise.all([
    request.text(),
    getSession(request, params),
  ]);

  let formData = new URLSearchParams(body);
  let redirectTo = validateRedirect(formData.get("redirect"), "/cart");
  let action = formData.get("_action");

  try {
    let cart = await session.getCart();

    switch (action) {
      case "set-quantity": {
        let variantId = formData.get("variantId");
        let quantityStr = formData.get("quantity");
        if (!variantId || !quantityStr) {
          break;
        }
        let quantity = Number.parseInt(quantityStr, 10);
        cart = updateCartItem(cart, variantId, quantity);
        break;
      }
      case "delete": {
        let variantId = formData.get("variantId");
        if (!variantId) {
          break;
        }
        cart = removeCartItem(cart, variantId);
        break;
      }
    }

    await session.setCart(cart);
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await session.commitSession(),
      },
    });
  } catch (error) {
    console.error(error);
  }

  return redirect(redirectTo);
}

export async function loader({ request, params }: LoaderArgs) {
  let session = await getSession(request, params);
  let lang = session.getLanguage();
  let cart = await session
    .getCart()
    .then((cartItems) => commerce.getCartInfo(lang, cartItems));

  return json({
    cart,
    translations: getTranslations(lang, [
      "Cart",
      "Add item",
      "Remove from cart",
      "Subtract item",
      "Quantity: $1",
      "Your cart is empty",
      "Subtotal",
      "Taxes",
      "Shipping",
      "Total",
      "Proceed to checkout",
    ]),
  });
}
