import type { ReactNode } from "react";
import { useMemo } from "react";
import { Link } from "remix";
import type { To } from "react-router-dom";
import cn from "classnames";
import { useId } from "@reach/auto-id";

import { WishlistIcon } from "./icons";
import { OptimizedImage } from "./optimized-image";

export type ThreeProductGridProduct = {
  id: string | number;
  title: ReactNode;
  formattedPrice: ReactNode;
  favorited: boolean;
  image: string;
  to: To;
};

function ThreeProductGridItem({
  backgroundColor,
  wishlistColors,
  product,
  index,
}: {
  backgroundColor: string;
  wishlistColors: string[];
  product: ThreeProductGridProduct;
  index: number;
}) {
  let id = `three-product-grid-item-${useId()}`;

  return (
    <li key={product.id} className={`three-product-grid__item-${index % 3}`}>
      <div
        className={cn(
          "group block relative aspect-square overflow-hidden",
          backgroundColor
        )}
      >
        <Link className="block group" prefetch="intent" to={product.to} aria-labelledby={id}>
          <OptimizedImage
            className="object-cover w-full h-full transform transition duration-500 motion-safe:group-focus:scale-110 motion-safe:group-hover:scale-110"
            src={product.image}
            width={480}
            height={480}
            responsive={
              index % 3 === 0
                ? [
                    {
                      size: {
                        height: 480,
                        width: 480,
                      },
                    },
                    {
                      size: {
                        height: 767,
                        width: 767,
                      },
                    },
                    {
                      size: {
                        height: 1024,
                        width: 1024,
                      },
                    },
                  ]
                : [
                    {
                      size: {
                        height: 480,
                        width: 480,
                      },
                    },
                    {
                      size: {
                        height: 600,
                        width: 600,
                      },
                    },
                  ]
            }
            alt=""
          />
        </Link>
        <div className="absolute top-0 left-0 right-0">
          <div className="flex">
            <Link
              prefetch="intent" to={product.to}
              className="group-tpgi block flex-1"
              tabIndex={-1}
              id={id}
            >
              <h1 className="inline-block py-2 px-4 bg-zinc-900 text-2xl font-semibold">
                {product.title}
              </h1>
              <br />
              <p className="inline-block text-sm py-2 px-4 bg-zinc-900">
                {product.formattedPrice}
              </p>
            </Link>
            <div>
              <button
                className={cn(
                  "p-2 bg-zinc-900 focus:bg-zinc-900 hover:bg-zinc-900 transition-colors ease-in-out duration-300",
                  ...wishlistColors
                )}
                onClick={() => alert("wishlist")}
              >
                <span className="sr-only">
                  Add "{product.title}" to wishlist
                </span>
                <WishlistIcon className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export function ThreeProductGrid({
  products,
  variant = "primary",
}: {
  products: ThreeProductGridProduct[];
  variant?: "primary" | "secondary";
}) {
  let [backgroundColors, wishlistColors] = useMemo(
    () =>
      [
        ["bg-pink-brand", "bg-yellow-brand", "bg-blue-brand"],
        [
          [
            "group-focus:bg-pink-brand",
            "group-hover:bg-pink-brand",
            "focus:bg-pink-brand",
            "hover:bg-pink-brand",
            "focus:text-zinc-900",
            "hover:text-zinc-900",
          ],
          [
            "group-focus:bg-yellow-brand",
            "group-hover:bg-yellow-brand",
            "focus:bg-yellow-brand",
            "hover:bg-yellow-brand",
            "focus:text-zinc-900",
            "hover:text-zinc-900",
          ],
          [
            "group-focus:bg-blue-brand",
            "group-hover:bg-blue-brand",
            "focus:bg-blue-brand",
            "hover:bg-blue-brand",
            "focus:text-zinc-900",
            "hover:text-zinc-900",
          ],
        ],
      ].map((colors) => {
        if (variant === "primary") return colors;

        return [colors[1], colors[0], colors[2]];
      }) as [string[], string[][]],
    [variant]
  );

  return (
    <section>
      <ul className={`three-product-grid-${variant} md:grid`}>
        {products.map((product, index) => (
          <ThreeProductGridItem
            key={product.id}
            product={product}
            index={index}
            backgroundColor={backgroundColors[index % 3]}
            wishlistColors={wishlistColors[index % 3]}
          />
        ))}
      </ul>
    </section>
  );
}
