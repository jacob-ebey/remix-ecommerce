import { useLoaderData } from "@remix-run/react";

import { CartListItem } from "~/components/cart-listitem";
import { CheckoutForm } from "~/components/checkout-form";
import { CartIcon } from "~/components/icons";

import type { loader } from "./cart.server";

export default function Cart() {
  let { cart, translations } = useLoaderData<typeof loader>();

  return (
    <main className="max-w-xl p-4 mx-auto lg:p-6">
      <h1 className="mb-8 text-3xl">{translations.Cart}</h1>
      {!cart?.items ? (
        <div className="flex flex-col items-center justify-center">
          <span className="flex items-center justify-center w-24 h-24 border border-dashed rounded-full border-primary bg-secondary text-secondary">
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
            className="pt-4 mt-24 border-t border-zinc-700"
            cart={cart}
            translations={translations}
          />
        </>
      )}
    </main>
  );
}
