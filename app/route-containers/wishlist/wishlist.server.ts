import type { ActionArgs, HeadersFunction, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import {
  updateCartItem,
  addToWishlist,
  updateWishlistItem,
  removeWishlistItem,
  getSession,
} from "~/session.server";
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
  let redirectTo = validateRedirect(formData.get("redirect"), "/wishlist");
  let action = formData.get("_action");

  try {
    let wishlist = await session.getWishlist();

    switch (action) {
      case "add": {
        let productId = formData.get("productId");
        let variantId = formData.get("variantId");
        if (!productId || !variantId) {
          break;
        }
        wishlist = addToWishlist(wishlist, productId, variantId, 1);
        break;
      }
      case "set-quantity": {
        let productId = formData.get("productId");
        let variantId = formData.get("variantId");
        let quantityStr = formData.get("quantity");
        if (!productId || !variantId || !quantityStr) {
          break;
        }
        let quantity = Number.parseInt(quantityStr, 10);
        wishlist = updateWishlistItem(wishlist, productId, variantId, quantity);
        break;
      }
      case "delete": {
        let variantId = formData.get("variantId");
        if (!variantId) {
          break;
        }
        wishlist = removeWishlistItem(wishlist, variantId);
        break;
      }
      case "move-to-cart": {
        let variantId = formData.get("variantId");
        if (!variantId) {
          break;
        }
        let wishlistItem = wishlist.find(
          (item) => item.variantId === variantId
        );
        if (!wishlistItem) {
          break;
        }
        let cart = await session.getCart();
        let existingCartItem = cart.find(
          (item) => item.variantId === variantId
        );
        wishlist = removeWishlistItem(wishlist, variantId);
        cart = updateCartItem(
          cart,
          wishlistItem.variantId,
          wishlistItem.quantity + (existingCartItem?.quantity || 0)
        );
        await session.setCart(cart);
      }
    }

    await session.setWishlist(wishlist);
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
  let wishlist = await session
    .getWishlist()
    .then((wishlistItems) => commerce.getWishlistInfo(lang, wishlistItems));

  return json({
    wishlist,
    translations: getTranslations(lang, [
      "Add item",
      "Remove from wishlist",
      "Subtract item",
      "Quantity: $1",
      "Your wishlist is empty",
      "Wishlist",
      "Move to cart",
    ]),
  });
}
