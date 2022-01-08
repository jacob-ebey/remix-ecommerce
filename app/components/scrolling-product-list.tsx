import { useMemo } from "react";
import type { ReactNode } from "react";
import type { To } from "react-router-dom";
import { Link } from "remix";
import cn from "classnames";

import { OptimizedImage } from "./optimized-image";

export type ScrollingProductListProduct = {
  id: string;
  title: ReactNode;
  image: string;
  to: To;
};

function ScrollingProductItem({
  title,
  image,
  to,
  disabled,
}: {
  title: ReactNode;
  image: string;
  to: To;
  disabled?: boolean;
}) {
  return (
    <li className="lg:pr-12 relative">
      <Link
        prefetch="intent"
        to={to}
        className="group block aspect-square overflow-hidden w-screen max-w-sm"
        tabIndex={disabled ? -1 : undefined}
      >
        <OptimizedImage
          loading="lazy"
          className="object-cover w-full h-full transform transition duration-500 motion-safe:group-focus:scale-105 motion-safe:group-hover:scale-105"
          src={image}
          alt=""
          width={480}
          height={480}
        />
        <div className="absolute top-0 left-0 flex h-full w-full items-center justify-end">
          <h1 className="inline-block py-2 px-4 bg-zinc-900 text-xl font-semibold">
            {title}
          </h1>
        </div>
      </Link>
    </li>
  );
}

export function ScrollingProductList({
  variant = "primary",
  products,
}: {
  variant?: "primary" | "secondary";
  products: ScrollingProductListProduct[];
}) {
  let items = useMemo(
    () =>
      products
        .slice(0, 3)
        .map((product) => (
          <ScrollingProductItem
            key={product.id}
            image={product.image}
            title={product.title}
            to={product.to}
          />
        )),
    [products]
  );

  let itemsDisabled = useMemo(
    () =>
      products
        .slice(0, 3)
        .map((product) => (
          <ScrollingProductItem
            key={product.id}
            image={product.image}
            title={product.title}
            to={product.to}
            disabled
          />
        )),
    [products]
  );

  return (
    <section
      className={cn(
        "flex whitespace-no-wrap overflow-x-scroll motion-safe:overflow-x-hidden border-t border-zinc-700",
        variant === "secondary" ? "bg-gray-50" : "bg-zinc-900"
      )}
    >
      <div className="relative">
        <ul className="flex motion-safe:animate-marquee">{items}</ul>
        <ul
          aria-hidden
          className="flex absolute top-0 motion-safe:animate-marquee2"
        >
          {itemsDisabled}
        </ul>
      </div>
    </section>
  );
}
