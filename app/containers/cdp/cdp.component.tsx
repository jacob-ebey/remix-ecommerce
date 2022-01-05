import { useRef } from "react";
import { Form, Link, useLoaderData, useLocation, useSubmit } from "remix";
import { useId } from "@reach/auto-id";
import cn from "classnames";

import { WishlistIcon } from "~/components/icons";
import { OptimizedImage } from "~/components/optimized-image";

import type { CDPProduct, LoaderData } from "./cdp.server";

function ThreeProductGridItem({ product }: { product: CDPProduct }) {
  let id = `three-product-grid-item-${useId()}`;

  return (
    <li key={product.id}>
      <div className="group block relative aspect-square overflow-hidden bg-zinc-800">
        <Link className="block group" to={product.to} aria-labelledby={id}>
          <OptimizedImage
            className="object-cover w-full h-full transform transition duration-500 motion-safe:group-focus:scale-110 motion-safe:group-hover:scale-110"
            src={product.image}
            width={480}
            height={480}
            responsive={[
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
            ]}
            alt=""
          />
        </Link>
        <div className="absolute top-0 left-0 right-0">
          <div className="flex">
            <Link
              to={product.to}
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
                  "group-focus:bg-pink-brand",
                  "group-hover:bg-pink-brand",
                  "focus:bg-pink-brand",
                  "hover:bg-pink-brand",
                  "focus:text-zinc-900",
                  "hover:text-zinc-900"
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

export default function CDP() {
  let { category, sort, categories, search, sortByOptions, products } =
    useLoaderData<LoaderData>();
  let formRef = useRef<HTMLFormElement>(null);
  let submit = useSubmit();
  let location = useLocation();

  let submitForm = () => {
    submit(formRef.current);
  };

  return (
    <main className="lg:flex">
      <nav className="hidden lg:block w-[20%] max-w-xs py-8 pl-6 pr-16">
        <h1 className="text-lg font-semibold">Categories</h1>
        <ul>
          {categories.map((cat) => (
            <li
              key={cat.slug}
              className={`mt-2 text-sm ${
                cat.slug !== category ? "text-gray-300" : ""
              }`}
            >
              <Link
                aria-selected={cat.slug !== category}
                className="focus:underline hover:underline whitespace-nowrap"
                to={(() => {
                  let params = new URLSearchParams(location.search);
                  params.delete("q");
                  params.set("category", cat.slug);
                  params.sort();
                  return location.pathname + "?" + params.toString();
                })()}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>

        <h1 className="text-lg font-semibold mt-8">Sort By</h1>
        <ul>
          {sortByOptions.map((sortBy) => (
            <li
              key={sortBy.value}
              className={`mt-2 text-sm ${
                sortBy.value !== sort ? "text-gray-300" : ""
              }`}
            >
              <Link
                aria-selected={sortBy.value !== sort}
                className="focus:underline hover:underline whitespace-nowrap"
                to={(() => {
                  let params = new URLSearchParams(location.search);
                  params.set("sort", sortBy.value);
                  return location.pathname + "?" + params.toString();
                })()}
              >
                {sortBy.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <Form
        ref={formRef}
        className="p-4 border-b border-zinc-700 lg:hidden lg:flex-1"
      >
        <label>
          <span className="sr-only">Categories</span>
          <select
            key={category}
            defaultValue={category}
            className="bg-zinc-900 border border-zinc-700 w-full block p-2"
            onChange={submitForm}
            name="category"
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Sort By</span>
          <select
            key={sort}
            defaultValue={sort}
            className="bg-zinc-900 border border-zinc-700 w-full block p-2 mt-4"
            onChange={submitForm}
            name="sort"
          >
            {sortByOptions.map((sortBy) => (
              <option key={sortBy.value} value={sortBy.value}>
                {sortBy.label}
              </option>
            ))}
          </select>
        </label>
        <noscript>
          <button className="block mt-4 px-4 py-2 border border-zinc-700">
            Update
          </button>
        </noscript>
      </Form>

      <article className="sm:px-4 lg:px-0 lg:pr-6 mb-8">
        <p className="pl-4 mt-4 mb-8">
          Showing {products.length} results
          {search ? ` for "${search}"` : ""}
        </p>
        <ul className="grid gap-4 grid-flow-row sm:grid-cols-2 md:grid-cols-3">
          {products.map((product, index) => (
            <ThreeProductGridItem key={product.id} product={product} />
          ))}
        </ul>
      </article>
    </main>
  );
}
