import { useMemo } from "react";
import { useLoaderData } from "remix";

import { CtaBanner } from "~/components/cta-banner";
import { ThreeProductGrid } from "~/components/three-product-grid";
import { ScrollingProductList } from "~/components/scrolling-product-list";

import type { LoaderData } from "./home.server";

function chunkProducts<T>(start: number, goal: number, products: T[]) {
  let slice = products.slice(start, start + 3);

  if (products.length < goal) return slice;
  for (let i = start + 3; slice.length < goal; i++) {
    slice.push(products[i % products.length]);
  }

  return slice;
}

export default function IndexPage() {
  let { featuredProducts, translations } = useLoaderData<LoaderData>();

  return (
    <main>
      <ThreeProductGrid
        variant="primary"
        products={useMemo(
          () => chunkProducts(0, 3, featuredProducts),
          [featuredProducts]
        )}
        translations={translations}
      />
      <ScrollingProductList
        variant="secondary"
        products={useMemo(
          () => chunkProducts(3, 3, featuredProducts),
          [featuredProducts]
        )}
      />
      <CtaBanner
        headline={translations.MockCTAHeadline}
        description={translations.MockCTADescription}
        ctaText={translations.MockCTALink}
        ctaTo="/"
        variant="secondary"
      />
      <ThreeProductGrid
        variant="secondary"
        products={useMemo(
          () => chunkProducts(6, 3, featuredProducts),
          [featuredProducts]
        )}
        translations={translations}
      />
      <ScrollingProductList
        variant="primary"
        products={useMemo(
          () => chunkProducts(9, 3, featuredProducts),
          [featuredProducts]
        )}
      />
    </main>
  );
}
