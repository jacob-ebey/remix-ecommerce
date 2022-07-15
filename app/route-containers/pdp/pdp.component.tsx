import type { ShouldReloadFunction } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";

import { ProductDetails } from "~/components/product-details";

import type { loader } from "./pdp.server";

export let unstable_shouldReload: ShouldReloadFunction = ({ prevUrl, url }) => {
  return prevUrl.toString() !== url.toString();
};

export const meta = ({ data }: { data: any }) => {
  return data?.product?.title
    ? {
        title: data.product.title,
        description: data.product.description,
      }
    : {
        title: "Remix Ecommerce",
        description: "An example ecommerce site built with Remix.",
      };
};

export default function ProductDetailPage() {
  let { product, translations } = useLoaderData<typeof loader>();

  return (
    <main>
      <ProductDetails product={product} translations={translations} />
    </main>
  );
}
