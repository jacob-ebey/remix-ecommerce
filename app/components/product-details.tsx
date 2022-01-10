import { useEffect, useRef, useState } from "react";
import type { MouseEventHandler } from "react";
import { Form, useLocation, useSearchParams, useTransition } from "remix";
import cn from "classnames";

import type { FullProduct } from "~/models/ecommerce-provider.server";
import { OptimizedImage } from "./optimized-image";
import { PickTranslations } from "~/translations.server";

export function ProductDetails({
  product,
  translations,
}: {
  product: FullProduct;
  translations: PickTranslations<
    "Add to cart" | "Sold out" | "Added!" | "Adding"
  >;
}) {
  let location = useLocation();
  let [searchParams] = useSearchParams();
  searchParams.sort();

  let disabled = !product.selectedVariantId || !product.availableForSale;

  return (
    <main>
      <div className="product-details-grid lg:grid pb-8 border-b border-zinc-700">
        <aside className="product-details-grid__media overflow-hidden border-b border-zinc-700 lg:border-none mb-4 lg:mb-0 relative">
          <ImageSlider images={product.images} />
        </aside>
        <article className="product-details-grid__details relative">
          <div className="sticky top-0 px-4 pt-4 lg:pt-8 lg:p-6 lg:pb-0">
            <h1 className="text-3xl font-bold mb-3">{product.title}</h1>
            <p className="text-xl mb-6">{product.formattedPrice}</p>
            {product.descriptionHtml ? (
              <div
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : product.description ? (
              <p className="leading-relaxed">{product.description}</p>
            ) : null}
            {product.options && product.options.length > 0 ? (
              <Form replace>
                {Array.from(searchParams.entries()).map(([key, value]) => (
                  <input
                    key={key + value}
                    type="hidden"
                    name={key}
                    defaultValue={value}
                  />
                ))}
                {product.options.map((option) => (
                  <div key={option.name} className="mt-6">
                    <h2 className="font-semibold">{option.name}</h2>
                    <ul className="mt-2" data-testid="product-option">
                      {option.values.map((value) => (
                        <li key={value} className="inline-block mr-2">
                          <button
                            aria-selected={
                              searchParams.get(option.name) === value
                            }
                            className={cn(
                              "px-4 py-2 border rounded hover:text-gray-300",
                              searchParams.get(option.name) === value
                                ? "border-gray-50"
                                : "border-zinc-700"
                            )}
                            name={option.name}
                            value={value}
                          >
                            {value}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {!!product.selectedVariantId && !product.availableForSale ? (
                  <p className="mt-6 text-red-500">
                    {translations["Sold out"]}
                  </p>
                ) : null}
              </Form>
            ) : null}
            <Form replace method="post" className="mt-8">
              <input
                type="hidden"
                name="_action"
                value={translations["Add to cart"]}
              />
              <input
                key={location.pathname + location.search}
                defaultValue={location.pathname + location.search}
                type="hidden"
                name="redirect"
              />
              <input
                key={product.selectedVariantId}
                defaultValue={product.selectedVariantId}
                type="hidden"
                name="variantId"
              />
              <button
                data-testid="add-to-cart"
                className={cn(
                  "py-4 text-gray-900 active:bg-gray-300 block w-full text-center font-semibold uppercase",
                  disabled ? "bg-gray-300" : "bg-gray-50"
                )}
                disabled={disabled}
              >
                <SubmissionSequenceText
                  action={translations["Add to cart"]}
                  strings={[translations["Add to cart"], "Adding...", "Added!"]}
                />
              </button>
            </Form>
          </div>
        </article>
      </div>
    </main>
  );
}

function SubmissionSequenceText({
  strings,
  action,
}: {
  strings: String[];
  action: string;
}) {
  let transition = useTransition();
  let [text, setText] = useState(strings[0]);

  useEffect(() => {
    if (transition.submission?.formData.get("_action") === action) {
      if (transition.state === "submitting") {
        setText(strings[1]);
      } else if (transition.state === "loading") {
        setText(strings[2]);
      }
    } else {
      let id = setTimeout(() => setText(strings[0]), 1000);
      return () => clearTimeout(id);
    }
  }, [transition]);

  return <span>{text}</span>;
}

function ImageSlider({ images }: { images: string[] }) {
  let sliderListRef = useRef<HTMLUListElement>(null);
  let scrollToImage: MouseEventHandler<HTMLButtonElement> = (event) => {
    let src = event.currentTarget
      .querySelector("img")
      ?.getAttribute("data-source");
    if (!src) return;
    let img = sliderListRef.current?.querySelector(
      `img[data-source=${JSON.stringify(src)}]`
    );
    img?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="sticky top-0 w-full max-h-screen lg:h-screen aspect-auto overflow-hidden flex flex-col bg-pink-brand">
        <div className="relative w-full flex-1 aspect-square lg:aspect-auto overflow-hidden">
          <ul
            ref={sliderListRef}
            className="absolute left-0 top-0 right-0 bottom-0 whitespace-nowrap overflow-y-hidden overflow-x-auto snap-x snap-mandatory"
          >
            {images.map((image, index) => (
              <li
                key={`${index}|${image}`}
                className="inline-block w-full h-full snap-start"
              >
                <OptimizedImage
                  data-source={image}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="w-full h-full object-contain"
                  src={image}
                  alt=""
                  height={480}
                  width={480}
                  responsive={[
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
                  ]}
                />
              </li>
            ))}
          </ul>
        </div>
        <ul className="flex overflow-x-auto bg-pink-600 h-full max-h-[20%]">
          {images.map((image, index) => (
            <li
              key={`${index}|${image}`}
              className="w-full aspect-square max-w-[25%]"
            >
              <button
                className="block relative h-full w-full hover:bg-pink-400"
                onClick={scrollToImage}
              >
                <span className="sr-only">Focus image {index + 1}</span>
                <OptimizedImage
                  data-source={image}
                  className="w-full h-full object-cover"
                  src={image}
                  alt=""
                  height={200}
                  width={200}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
