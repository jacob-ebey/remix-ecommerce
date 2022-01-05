import { useLoaderData } from "remix";

import { CartListItem } from "~/components/cart-listitem";
import { CheckoutForm } from "~/components/checkout-form";
import { CartIcon } from "~/components/icons";

import type { LoaderData } from "./cart.server";

export default function Cart() {
  let { cart, translations } = useLoaderData<LoaderData>();

  return (
    <main className="p-4 lg:p-6 max-w-xl mx-auto">
      <h1 className="text-3xl mb-8">{translations.Cart}</h1>
      {!cart?.items ? (
        <div className="flex flex-col justify-center items-center">
          <span className="border border-dashed border-primary rounded-full flex items-center justify-center w-24 h-24 bg-secondary text-secondary">
            <CartIcon className="block w-8 h-8" />
          </span>
          <h1 className="pt-6 text-2xl font-bold tracking-wide text-center">
            {translations["Your cart is empty"]}
          </h1>
        </div>
      ) : (
        <>
          <ul>
            {cart.items.map((item) => (
              <CartListItem
                key={item.variantId}
                formattedOptions={item.info.formattedOptions}
                quantity={item.quantity}
                formattedPrice={item.info.formattedPrice}
                image={item.info.image}
                title={item.info.title}
                variantId={item.variantId}
                translations={translations}
              />
            ))}
          </ul>

          <CheckoutForm
            className="mt-24 pt-4 border-t border-zinc-700"
            cart={cart}
            translations={translations}
          />
        </>
      )}
    </main>
  );
}
