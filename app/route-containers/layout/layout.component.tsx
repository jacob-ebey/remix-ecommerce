import { Suspense, lazy, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { MetaFunction } from "@remix-run/node";
import { LinksFunction } from "@remix-run/node";
import type { ShouldReloadFunction } from "@remix-run/react";
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
} from "@remix-run/react";

import { ClientOnly } from "~/components/client-only";
import { Footer } from "~/components/footer";
import { Navbar, NavbarCategory } from "~/components/navbar";

import logoHref from "~/images/remix-glow.svg";
import globalStylesheetHref from "~/styles/global.css";

import { GenericCatchBoundary } from "../boundaries/generic-catch-boundary";
import { GenericErrorBoundary } from "../boundaries/generic-error-boundary";
import type { loader } from "./layout.server";

let CartPopover = lazy(() =>
  import("~/components/cart-popover").then(({ CartPopover }) => ({
    default: CartPopover,
  }))
);
let LanguageDialog = lazy(() =>
  import("~/components/language-dialog").then(({ LanguageDialog }) => ({
    default: LanguageDialog,
  }))
);
let WishlistPopover = lazy(() =>
  import("~/components/wishlist-popover").then(({ WishlistPopover }) => ({
    default: WishlistPopover,
  }))
);

export const meta: MetaFunction = () => {
  return {
    title: "Remix Ecommerce",
    description: "An example ecommerce site built with Remix.",
  };
};

export let links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: globalStylesheetHref,
    },
  ];
};

export function Document({ children }: { children: ReactNode }) {
  let matches = useMatches();
  let rootMatch = matches.find((match) => match.id === "root");
  let loaderData = rootMatch?.data as
    | UseDataFunctionReturn<typeof loader>
    | undefined;

  let { cart, categories, lang, pages, translations, wishlist } =
    loaderData || {
      lang: "en",
      pages: [],
    };

  let allCategories = useMemo(() => {
    let results: NavbarCategory[] = translations
      ? [
          {
            name: translations.All,
            to: `/${lang}/search`,
          },
        ]
      : [];

    if (categories) {
      results.push(...categories);
    }
    return results;
  }, [categories]);

  let [cartOpen, setCartOpen] = useState(false);
  let [wishlistOpen, setWishlistOpen] = useState(false);

  let cartCount = useMemo(
    () => cart?.items?.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  let wishlistCount = useMemo(
    () => wishlist?.reduce((sum, item) => sum + item.quantity, 0),
    [wishlist]
  );

  return (
    <html lang={lang} className="text-gray-100 bg-zinc-900">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col min-h-screen">
        <Navbar
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          lang={lang}
          logoHref={logoHref}
          storeName={translations?.["Store Name"]}
          categories={allCategories}
          translations={translations}
          onOpenCart={() => setCartOpen(true)}
          onOpenWishlist={() => setWishlistOpen(true)}
        />
        <div className="flex-1">{children}</div>
        <Footer
          lang={lang}
          logoHref={logoHref}
          pages={pages}
          storeName={translations?.["Store Name"]}
        />

        {translations ? (
          <ClientOnly>
            <Suspense fallback="">
              <LanguageDialog lang={lang} translations={translations} />
            </Suspense>
          </ClientOnly>
        ) : null}

        {translations ? (
          <ClientOnly>
            <Suspense fallback="">
              <WishlistPopover
                wishlistCount={wishlistCount}
                wishlist={wishlist}
                open={wishlistOpen}
                translations={translations}
                onClose={() => setWishlistOpen(false)}
              />
            </Suspense>
          </ClientOnly>
        ) : null}

        {translations ? (
          <ClientOnly>
            <Suspense fallback="">
              <CartPopover
                cartCount={cartCount}
                cart={cart}
                open={cartOpen}
                translations={translations}
                onClose={() => setCartOpen(false)}
              />
            </Suspense>
          </ClientOnly>
        ) : null}

        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export function CatchBoundary() {
  return (
    <Document>
      <GenericCatchBoundary />
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <GenericErrorBoundary error={error} />
    </Document>
  );
}

export let unstable_shouldReload: ShouldReloadFunction = ({ url }) => {
  return !url.pathname.startsWith("/search");
};

export default function Root() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}
