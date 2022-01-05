import { json } from "remix";
import type { LoaderFunction } from "remix";
import type { To } from "react-router-dom";

import type {
  Category,
  SortByOption,
} from "~/models/ecommerce-provider.server";
import commerce from "~/commerce.server";
import { getSession } from "~/session.server";

export type CDPProduct = {
  id: string | number;
  title: string;
  formattedPrice: string;
  favorited: boolean;
  image: string;
  to: To;
};

export type LoaderData = {
  category?: string;
  sort?: string;
  categories: Category[];
  search?: string;
  sortByOptions: SortByOption[];
  products: CDPProduct[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let session = await getSession(request, params);
  let lang = session.getLanguage();
  let url = new URL(request.url);

  let category = url.searchParams.get("category") || undefined;
  let sort = url.searchParams.get("sort") || undefined;
  let search = url.searchParams.get("q") || undefined;

  let [categories, sortByOptions, products] = await Promise.all([
    commerce.getCategories(lang, 250),
    commerce.getSortByOptions(lang),
    commerce.getProducts(lang, category, sort, search),
  ]);

  return json<LoaderData>({
    category,
    sort,
    categories,
    search,
    sortByOptions,
    products: products.map((product) => ({
      favorited: product.favorited,
      formattedPrice: product.formattedPrice,
      id: product.id,
      image: product.image,
      title: product.title,
      to: `/${lang}/product/${product.slug}`,
    })),
  });
};
