import { useLoaderData } from "@remix-run/react";

import { WishlistListItem } from "~/components/wishlist-listitem";
import { WishlistIcon } from "~/components/icons";

import type { loader } from "./wishlist.server";

export default function Wishlist() {
  let { wishlist, translations } = useLoaderData<typeof loader>();

  return (
    <main className="max-w-xl p-4 mx-auto lg:p-6">
      <h1 className="mb-8 text-3xl">{translations.Wishlist}</h1>
      {!wishlist ? (
        <div className="flex flex-col items-center justify-center">
          <span className="flex items-center justify-center w-24 h-24 border border-dashed rounded-full border-primary bg-secondary text-secondary">
            <WishlistIcon className="block w-8 h-8" />
          </span>
          <h1 className="pt-6 text-2xl font-bold tracking-wide text-center">
            {translations["Your wishlist is empty"]}
          </h1>
        </div>
      ) : (
        <>
          <ul>
            {wishlist.map((item) => (
              <WishlistListItem
                key={item.variantId}
                formattedOptions={item.info.formattedOptions}
                quantity={item.quantity}
                formattedPrice={item.info.formattedPrice}
                image={item.info.image}
                title={item.info.title}
                variantId={item.variantId}
                productId={item.productId}
                translations={translations}
              />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
