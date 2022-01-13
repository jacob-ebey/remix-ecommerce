import { useLoaderData } from "remix";

import { WishlistListItem } from "~/components/wishlist-listitem";
import { WishlistIcon } from "~/components/icons";

import type { LoaderData } from "./wishlist.server";

export default function Wishlist() {
  let { wishlist, translations } = useLoaderData<LoaderData>();

  return (
    <main className="p-4 lg:p-6 max-w-xl mx-auto">
      <h1 className="text-3xl mb-8">{translations.Wishlist}</h1>
      {!wishlist ? (
        <div className="flex flex-col justify-center items-center">
          <span className="border border-dashed border-primary rounded-full flex items-center justify-center w-24 h-24 bg-secondary text-secondary">
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
