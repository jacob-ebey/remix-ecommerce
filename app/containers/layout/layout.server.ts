import { json } from "remix";
import type { LoaderFunction } from "remix";

import commerce from "~/commerce.server";
import { getSession } from "~/session.server";
import { getTranslations } from "~/translations.server";
import type { PickTranslations } from "~/translations.server";
import type {
  CartInfo,
  FullWishlistItem,
} from "~/models/ecommerce-provider.server";
import type { Language } from "~/models/language";

import type { FooterPage } from "~/components/footer";
import type { NavbarCategory } from "~/components/navbar";

export type LoaderData = {
  cart?: CartInfo;
  lang: Language;
  categories: NavbarCategory[];
  pages: FooterPage[];
  wishlist?: FullWishlistItem[];
  translations: PickTranslations<
    | "All"
    | "Cart"
    | "Close"
    | "Close Menu"
    | "Home"
    | "Open Menu"
    | "Search for products..."
    | "Store Name"
    | "Wishlist"
    | "Looks like your language doesn't match"
    | "Would you like to switch to $1?"
    | "Yes"
    | "No"
    | "Your cart is empty"
    | "Quantity: $1"
    | "Remove from cart"
    | "Subtract item"
    | "Add item"
    | "Proceed to checkout"
    | "Subtotal"
    | "Total"
    | "Taxes"
    | "Shipping"
    | "Your wishlist is empty"
    | "Remove from wishlist"
    | "Move to cart"
  >;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let session = await getSession(request, params);
  let lang = session.getLanguage();
  let [categories, pages, cart, wishlist] = await Promise.all([
    commerce.getCategories(lang, 2),
    commerce.getPages(lang),
    session
      .getCart()
      .then((cartItems) => commerce.getCartInfo(lang, cartItems)),
    session
      .getWishlist()
      .then((wishlistItems) => commerce.getWishlistInfo(lang, wishlistItems)),
  ]);

  let translations = getTranslations(lang, [
    "All",
    "Cart",
    "Close",
    "Close Menu",
    "Home",
    "Open Menu",
    "Search for products...",
    "Store Name",
    "Wishlist",
    "Looks like your language doesn't match",
    "Would you like to switch to $1?",
    "Yes",
    "No",
    "Your cart is empty",
    "Quantity: $1",
    "Remove from cart",
    "Subtract item",
    "Add item",
    "Proceed to checkout",
    "Subtotal",
    "Total",
    "Taxes",
    "Shipping",
    "Your wishlist is empty",
    "Remove from wishlist",
    "Move to cart",
  ]);

  return json<LoaderData>({
    cart,
    lang,
    pages: [
      {
        id: "home",
        title: translations.Home,
        to: `/${lang}`,
      },
      ...pages.map(({ id, slug, title }) => ({
        id,
        title,
        to: `/${lang}/${slug}`,
      })),
    ],
    categories: [
      ...categories.map(({ name, slug }) => ({
        name,
        to: `${lang}/search?category=${slug}`,
      })),
    ],
    translations,
    wishlist,
  });
};
