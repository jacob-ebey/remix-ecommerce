import type { ReactNode } from "react";
import { useFetcher, useLocation } from "@remix-run/react";
import Image from "remix-image";
import cn from "classnames";

import { PickTranslations } from "~/translations.server";

import { CloseIcon, MinusIcon, PlusIcon } from "./icons";

enum Actions {
  setQuantity = "set-quantity",
  delete = "delete",
}

export function CartListItem({
  formattedOptions,
  formattedPrice,
  image,
  quantity,
  title,
  variantId,
  translations,
}: {
  formattedOptions: ReactNode;
  formattedPrice: ReactNode;
  image: string;
  quantity: number;
  title: ReactNode;
  variantId: string;
  translations: PickTranslations<
    "Add item" | "Remove from cart" | "Subtract item" | "Quantity: $1"
  >;
}) {
  let location = useLocation();
  let fetcher = useFetcher();
  let optimisticQuantity = quantity;
  let optimisticDeleting = false;

  if (fetcher.submission) {
    let values = Object.fromEntries(fetcher.submission.formData);
    if (typeof values.quantity === "string") {
      optimisticQuantity = parseInt(values.quantity, 10);
    }

    if (values._action === Actions.delete) {
      optimisticDeleting = true;
    }
  }

  return (
    <li key={variantId} className="mb-6" hidden={optimisticDeleting}>
      <div className="flex">
        <div className="relative block w-16 mr-4 aspect-square">
          <Image
            unoptimized
            className="absolute inset-0 bg-pink-brand"
            src={image}
            alt=""
            responsive={[
              {
                size: {
                  width: 64,
                  height: 64,
                },
                maxWidth: 80,
              },
              {
                size: {
                  width: 128,
                  height: 128,
                },
              },
            ]}
          />
        </div>
        <div className="flex-1 pr-2">
          <h2 className="text-lg">{title}</h2>
          {formattedOptions ? (
            <p className="text-sm text-gray-300">{formattedOptions}</p>
          ) : null}
        </div>
        <p className="text-sm">{formattedPrice}</p>
      </div>
      <div className="flex mt-2">
        <fetcher.Form method="post" action="/cart">
          <input type="hidden" name="_action" defaultValue={Actions.delete} />
          <input
            key={location.pathname + location.search}
            type="hidden"
            name="redirect"
            defaultValue={location.pathname + location.search}
          />
          <input
            key={variantId}
            type="hidden"
            defaultValue={variantId}
            name="variantId"
          />
          <button
            data-testid="remove-from-cart"
            type="submit"
            className="flex items-center justify-center mr-2 border w-9 h-9 border-zinc-700"
          >
            <span className="sr-only">{translations["Remove from cart"]}</span>
            <CloseIcon className="w-6 h-6" />
          </button>
        </fetcher.Form>
        <div className="flex-1 p-1 px-3 border border-zinc-700 h-9">
          <span className="sr-only">
            {translations["Quantity: $1"]?.replace(
              "$1",
              optimisticQuantity.toFixed(0)
            )}
          </span>
          <span aria-hidden={true}>{optimisticQuantity.toFixed(0)}</span>
        </div>
        <fetcher.Form action="/cart" method="post">
          <input type="hidden" name="_action" value={Actions.setQuantity} />
          <input
            type="hidden"
            name="redirect"
            value={location.pathname + location.search}
          />
          <input type="hidden" value={variantId} name="variantId" />
          <input
            type="hidden"
            name="quantity"
            disabled={quantity - 1 <= 0}
            value={Math.max(0, optimisticQuantity - 1).toFixed(0)}
          />
          <button
            data-testid="decrement-cart"
            type="submit"
            disabled={quantity - 1 <= 0}
            className={cn(
              "w-9 h-9 flex items-center justify-center border border-zinc-700 border-l-0",
              quantity - 1 <= 0 && "text-gray-300"
            )}
          >
            <span className="sr-only">{translations["Subtract item"]}</span>
            <MinusIcon className="w-6 h-6" />
          </button>
        </fetcher.Form>
        <fetcher.Form action="/cart" method="post">
          <input
            type="hidden"
            name="_action"
            defaultValue={Actions.setQuantity}
          />
          <input
            key={location.pathname + location.search}
            type="hidden"
            name="redirect"
            value={location.pathname + location.search}
          />
          <input type="hidden" value={variantId} name="variantId" />
          <input
            type="hidden"
            name="quantity"
            value={(optimisticQuantity + 1).toFixed(0)}
          />
          <button
            data-testid="increment-cart"
            type="submit"
            className="flex items-center justify-center border border-l-0 w-9 h-9 border-zinc-700"
          >
            <span className="sr-only">{translations["Add item"]}</span>
            <PlusIcon className="w-6 h-6" />
          </button>
        </fetcher.Form>
      </div>
    </li>
  );
}
