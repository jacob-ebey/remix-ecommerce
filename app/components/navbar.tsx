import { Fragment, Suspense, useState } from "react";
import { Await, Form, Link, PrefetchPageLinks } from "@remix-run/react";
import type { To } from "react-router-dom";
import { Popover, Transition } from "@headlessui/react";

import type { PickTranslations } from "~/translations.server";
import type {
  CartInfo,
  FullWishlistItem,
} from "~/models/ecommerce-provider.server";
import type { Language } from "~/models/language";

import { CartIcon, CloseIcon, MenuIcon, WishlistIcon } from "./icons";
import { OptimizedImage } from "./optimized-image";

export type NavbarCategory = {
  name: string;
  to: To;
};

export function Navbar({
  onOpenCart,
  onOpenWishlist,
  lang,
  logoHref,
  storeName,
  categories,
  translations,
  cart,
  wishlist,
}: {
  cart?: Promise<CartInfo | null>;
  wishlist?: Promise<FullWishlistItem[] | null>;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  lang: Language;
  logoHref: string;
  storeName?: string;
  categories: NavbarCategory[];
  translations?: PickTranslations<
    | "Cart"
    | "Close Menu"
    | "Home"
    | "Open Menu"
    | "Search for products..."
    | "Wishlist"
  >;
}) {
  let [prefetchQuery, setPrefetchSeachQuery] = useState("");

  return (
    <nav className="p-4 border-b lg:px-6 border-zinc-700">
      <div className="flex">
        <div className="flex items-center flex-1">
          <Link prefetch="intent" to={`/${lang}`}>
            {translations ? (
              <span className="sr-only">{translations.Home}</span>
            ) : null}
            {logoHref.endsWith(".svg") ? (
              <img
                className="w-10 h-10"
                src={logoHref}
                alt=""
                width={40}
                height={40}
              />
            ) : (
              <OptimizedImage
                className="w-10 h-10"
                src={logoHref}
                alt=""
                width={40}
                height={40}
                responsive={[
                  {
                    size: {
                      width: 80,
                      height: 80,
                    },
                  },
                ]}
              />
            )}
          </Link>
          {storeName ? <h1 className="sr-only">{storeName}</h1> : null}
          <ul className="items-center hidden mx-4 overflow-x-auto lg:flex">
            {categories.map((category, i) => (
              <li key={category.name + "|" + i} className="mx-2">
                <Link
                  className="whitespace-nowrap hover:text-gray-300"
                  prefetch="intent"
                  to={category.to}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
          <Form
            data-testid="search-form"
            action={`/${lang}/search`}
            className="flex-1 hidden max-w-lg mx-auto lg:block"
          >
            <input
              data-testid="search-input"
              name="q"
              className="w-full p-2 border bg-zinc-900 border-zinc-700"
              placeholder={translations?.["Search for products..."]}
              onChange={(e) => setPrefetchSeachQuery(e.target.value)}
            />
          </Form>
          {prefetchQuery && (
            <PrefetchPageLinks page={`/${lang}/search?q=${prefetchQuery}`} />
          )}
        </div>
        <div className="flex items-center">
          <Link
            data-testid="cart-link"
            to={`/${lang}/cart`}
            className="relative inline-block ml-4 group hover:text-gray-300"
            onClick={(event) => {
              if (onOpenCart) {
                event.preventDefault();
                onOpenCart();
              }
            }}
          >
            {translations ? (
              <span className="sr-only">{translations.Cart}</span>
            ) : null}
            <CartIcon className="w-8 h-8" />
            <Suspense>
              <Await resolve={cart}>
                {(cart) => {
                  let cartCount = cart?.items?.reduce(
                    (acc, item) => acc + (item.quantity || 0),
                    0
                  );

                  return (
                    !!cartCount && (
                      <span
                        data-testid="cart-count"
                        style={{ lineHeight: "0.75rem" }}
                        className="absolute bottom-0 left-0 translate translate-y-[25%] translate-x-[-25%] inline-flex items-center justify-center px-[0.25rem] py-[0.125rem] text-xs text-zinc-900 bg-gray-50 group-hover:bg-gray-300 rounded-full"
                      >
                        {cartCount}
                      </span>
                    )
                  );
                }}
              </Await>
            </Suspense>
          </Link>
          <Link
            data-testid="wishlist-link"
            to={`/${lang}/wishlist`}
            className="relative ml-4 group hover:text-gray-300"
            onClick={(event) => {
              if (onOpenWishlist) {
                event.preventDefault();
                onOpenWishlist();
              }
            }}
          >
            <span className="sr-only">
              {translations ? translations["Wishlist"] : null}
            </span>
            <WishlistIcon className="w-8 h-8" />
            <Suspense>
              <Await resolve={wishlist}>
                {(wishlist) => {
                  let wishlistCount = wishlist?.reduce(
                    (acc, item) => acc + item.quantity,
                    0
                  );

                  return (
                    !!wishlistCount && (
                      <span
                        data-testid="wishlist-count"
                        style={{ lineHeight: "0.75rem" }}
                        className="absolute bottom-0 left-0 translate translate-y-[25%] translate-x-[-25%] inline-flex items-center justify-center px-[0.25rem] py-[0.125rem] text-xs text-zinc-900 bg-gray-50 group-hover:bg-gray-300 rounded-full"
                      >
                        {wishlistCount}
                      </span>
                    )
                  );
                }}
              </Await>
            </Suspense>
          </Link>
          <Popover className="relative flex items-center ml-4 lg:hidden">
            {({ close }) => (
              <>
                <Popover.Button className="hover:text-gray-300">
                  {translations ? (
                    <span className="sr-only">{translations["Open Menu"]}</span>
                  ) : null}
                  <MenuIcon className="w-8 h-8" />
                </Popover.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Popover.Panel
                    className="fixed top-0 bottom-0 left-0 right-0 z-10 p-4 bg-zinc-900"
                    focus
                  >
                    <div className="flex">
                      <div className="flex items-center flex-1">
                        <OptimizedImage
                          className="w-10 h-10"
                          src={logoHref}
                          alt=""
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="flex flex-row-reverse">
                        <Popover.Button className="hover:text-gray-300">
                          {translations ? (
                            <span className="sr-only">
                              {translations["Close Menu"]}
                            </span>
                          ) : null}
                          <CloseIcon className="w-8 h-8" />
                        </Popover.Button>
                      </div>
                    </div>
                    <ul className="mt-4">
                      {categories.map((category, i) => (
                        <li key={category.name + "|" + i} className="mb-1">
                          <Link
                            onClick={() => close()}
                            className="text-xl text-blue-400 hover:text-blue-500"
                            prefetch="intent"
                            to={category.to}
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
      </div>
      <Form
        data-testid="mobile-search-form"
        action={`/${lang}/search`}
        className="mt-3 lg:hidden"
      >
        <input
          data-testid="mobile-search-input"
          name="q"
          className="w-full p-2 border bg-zinc-900 border-zinc-700"
          placeholder={translations?.["Search for products..."]}
        />
      </Form>
    </nav>
  );
}
