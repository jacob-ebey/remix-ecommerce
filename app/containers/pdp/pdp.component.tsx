import { useLoaderData } from "remix";
import type { ShouldReloadFunction } from "remix";

import { ProductDetails } from "~/components/product-details";

import type { LoaderData } from "./pdp.server";

export let unstable_shouldReload: ShouldReloadFunction = ({ prevUrl, url }) => {
  return prevUrl.toString() !== url.toString();
};

export const meta = ({ data }: { data?: LoaderData }) => {
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
  let { product, translations } = useLoaderData<LoaderData>();

  return (
    <main>
      <ProductDetails product={product} translations={translations} />
    </main>
  );
}
