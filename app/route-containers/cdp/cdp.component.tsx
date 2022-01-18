import type { ChangeEventHandler } from "react";
import { Form, Link, useLoaderData, useLocation, useSubmit } from "remix";

import { CdpProductGridItem } from "~/components/cdp-product-grid-item";

import type { LoaderData } from "./cdp.server";

export default function CDP() {
  let {
    category,
    sort,
    categories,
    search,
    sortByOptions,
    products,
    hasNextPage,
    nextPageCursor,
    translations,
  } = useLoaderData<LoaderData>();
  let submit = useSubmit();
  let location = useLocation();

  let submitForm: ChangeEventHandler<HTMLSelectElement> = (event) => {
    submit((event.currentTarget || event.target).closest("form"));
  };

  return (
    <main className="lg:grid gap-6 grid-cols-12">
      <nav className="hidden lg:block col-span-2 py-8 pl-6">
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
                data-testid="category-link"
                aria-selected={cat.slug !== category}
                className="focus:underline hover:underline whitespace-nowrap"
                prefetch="intent"
                to={(() => {
                  let params = new URLSearchParams(location.search);
                  params.delete("cursor");
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
                data-testid="sort-by-link"
                aria-selected={sortBy.value !== sort}
                className="focus:underline hover:underline whitespace-nowrap"
                prefetch="intent"
                to={(() => {
                  let params = new URLSearchParams(location.search);
                  params.delete("cursor");
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
        className="px-4 pt-4 lg:hidden"
        action={(() => {
          let params = new URLSearchParams(location.search);
          params.delete("category");
          params.delete("cursor");
          params.delete("q");
          let search = params.toString();
          search = search ? "?" + search : "";
          return location.pathname + search;
        })()}
      >
        <label>
          <span className="sr-only">Categories</span>
          <select
            data-testid="category-select"
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
        <noscript>
          <button className="block mt-4 px-4 py-2 border border-zinc-700">
            Update
          </button>
        </noscript>
      </Form>
      <Form
        className="px-4 pb-2 border-b border-zinc-700 lg:hidden"
        action={(() => {
          let params = new URLSearchParams(location.search);
          params.delete("cursor");
          params.delete("sort");
          let search = params.toString();
          search = search ? "?" + search : "";
          return location.pathname + search;
        })()}
      >
        <label>
          <span className="sr-only">Sort By</span>
          <select
            data-testid="sort-by-select"
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

      <article className="sm:px-4 lg:px-0 lg:pr-6 mb-8 col-start-3 col-span-10">
        <p data-testid="search-results-label" className="pl-4 mt-4 mb-8">
          Showing {products.length} results
          {search ? ` for "${search}"` : ""}
        </p>
        <ul className="grid gap-4 grid-flow-row sm:grid-cols-2 md:grid-cols-3">
          {products.map((product, index) => (
            <CdpProductGridItem
              key={product.id}
              product={product}
              translations={translations}
            />
          ))}
        </ul>
        {hasNextPage && nextPageCursor && (
          <p className="mt-8">
            <Link
              className="text-lg font-semibold focus:underline hover:underline"
              to={(() => {
                let params = new URLSearchParams(location.search);
                params.set("cursor", nextPageCursor);
                return location.pathname + "?" + params.toString();
              })()}
            >
              Load more
            </Link>
          </p>
        )}
      </article>
    </main>
  );
}
