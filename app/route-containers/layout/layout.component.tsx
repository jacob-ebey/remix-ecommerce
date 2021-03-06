import { Suspense, lazy, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Deferred } from "@remix-run/react";
import type {
  ShouldReloadFunction,
  UseDataFunctionReturn,
} from "@remix-run/react";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from "@remix-run/react";

import { ClientOnly } from "~/components/client-only";
import { Footer } from "~/components/footer";
import { Navbar, NavbarCategory } from "~/components/navbar";
import { multipleDeferred } from "~/utils/deferred";

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

function Layout({
  cart,
  wishlist,
  children,
}: {
  children?: ReactNode;
  cart?: UseDataFunctionReturn<typeof loader>["cart"];
  wishlist?: UseDataFunctionReturn<typeof loader>["wishlist"];
}) {
  let matches = useMatches();
  let rootMatch = matches.find((match) => match.id === "root");
  let loaderData = rootMatch?.data as
    | UseDataFunctionReturn<typeof loader>
    | undefined;

  let { categories, lang, pages, translations } = loaderData || {
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

  return (
    <>
      <Suspense
        fallback={
          <Navbar
            lang={lang}
            logoHref={logoHref}
            storeName={translations?.["Store Name"]}
            categories={allCategories}
            translations={translations}
          />
        }
      >
        <Deferred value={multipleDeferred({ cart, wishlist })}>
          {({ cart, wishlist }) => (
            <Navbar
              cart={cart}
              wishlist={wishlist}
              lang={lang}
              logoHref={logoHref}
              storeName={translations?.["Store Name"]}
              categories={allCategories}
              translations={translations}
              onOpenCart={() => setCartOpen(true)}
              onOpenWishlist={() => setWishlistOpen(true)}
            />
          )}
        </Deferred>
      </Suspense>
      <div className="flex-1">{children}</div>
      <Footer
        lang={lang}
        logoHref={logoHref}
        pages={pages}
        storeName={translations?.["Store Name"]}
      />

      {translations ? (
        <ClientOnly>
          <Suspense>
            <LanguageDialog lang={lang} translations={translations} />
          </Suspense>
        </ClientOnly>
      ) : null}

      {translations ? (
        <Suspense>
          <Deferred value={wishlist}>
            {(wishlist) => (
              <ClientOnly>
                <WishlistPopover
                  wishlist={wishlist}
                  open={wishlistOpen}
                  translations={translations!}
                  onClose={() => setWishlistOpen(false)}
                />
              </ClientOnly>
            )}
          </Deferred>
        </Suspense>
      ) : null}

      {translations ? (
        <Suspense>
          <Deferred value={cart}>
            {(cart) => (
              <ClientOnly>
                <CartPopover
                  cart={cart}
                  open={cartOpen}
                  translations={translations!}
                  onClose={() => setCartOpen(false)}
                />
              </ClientOnly>
            )}
          </Deferred>
        </Suspense>
      ) : null}
    </>
  );
}

function Document({ children }: { children: ReactNode }) {
  let matches = useMatches();
  let rootMatch = matches.find((match) => match.id === "root");
  let loaderData = rootMatch?.data as
    | UseDataFunctionReturn<typeof loader>
    | undefined;

  let { cart, lang, wishlist } = loaderData || {
    lang: "en",
    pages: [],
  };

  return (
    <html lang={lang} className="text-gray-100 bg-zinc-900">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col min-h-screen">
        <Layout cart={cart} wishlist={wishlist}>
          {children}
        </Layout>

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
