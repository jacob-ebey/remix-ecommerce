import type { ReactNode } from "react";
import { useFetcher, useLocation } from "remix";
import cn from "classnames";

import { PickTranslations } from "~/translations.server";

import { OptimizedImage } from "./optimized-image";

import { CloseIcon, MinusIcon, PlusIcon } from "./icons";

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
  let { Form } = useFetcher();

  return (
    <li key={variantId} className="mb-6">
      <div className="flex">
        <div className="relative block aspect-square w-16 mr-4">
          <OptimizedImage
            className="absolute inset-0 bg-pink-brand"
            src={image}
            alt=""
            responsive={[
              {
                size: {
                  width: 64,
                  height: 64,
                },
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
        <Form method="post" action="/cart">
          <input type="hidden" name="_action" defaultValue="delete" />
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
            type="submit"
            className="w-9 h-9 flex items-center justify-center border border-zinc-700 mr-2"
          >
            <span className="sr-only">{translations["Remove from cart"]}</span>
            <CloseIcon className="w-6 h-6" />
          </button>
        </Form>
        <div className="p-1 px-3 border border-zinc-700 flex-1 h-9">
          <span className="sr-only">
            {translations["Quantity: $1"]?.replace("$1", quantity.toString())}
          </span>
          <span aria-hidden={true}>{quantity}</span>
        </div>
        <Form action="/cart" method="post">
          <input type="hidden" name="_action" defaultValue="set-quantity" />
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
          <input
            key={quantity - 1 <= 0 ? 1 : quantity - 1}
            type="hidden"
            name="quantity"
            disabled={quantity - 1 <= 0}
            defaultValue={quantity - 1 <= 0 ? 1 : quantity - 1}
          />
          <button
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
        </Form>
        <Form action="/cart" method="post">
          <input type="hidden" name="_action" defaultValue="set-quantity" />
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
          <input
            key={quantity + 1}
            type="hidden"
            name="quantity"
            defaultValue={quantity + 1}
          />
          <button
            type="submit"
            className="w-9 h-9 flex items-center justify-center border border-zinc-700 border-l-0"
          >
            <span className="sr-only">{translations["Add item"]}</span>
            <PlusIcon className="w-6 h-6" />
          </button>
        </Form>
      </div>
    </li>
  );
}
