import type { ShouldReloadFunction } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";

import { ProductDetails } from "~/components/product-details";

import type { loader } from "./pdp.server";

// FIXME: optimize this when we know how to derive the variantId in the "add to
// cart action" so we don't need to make a request on search param changes only
export let unstable_shouldReload: ShouldReloadFunction = () => {
  return false;
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
