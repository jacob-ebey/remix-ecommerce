import { Decimal } from "decimal.js";

import type {
  EcommerceProvider,
  Category,
  Page,
  Product,
  FullCartItem,
  FullWishlistItem,
} from "../ecommerce-provider.server";
import type { RequestResponseCache } from "../request-response-cache.server";

import { getTranslations } from "~/translations.server";

export interface ShopifyProviderOptions {
  cache?: RequestResponseCache;
  maxAgeSeconds?: number | ((request: Request) => number);
  shop: string;
  storefrontAccessToken: string;
}

export function createShopifyProvider({
  cache,
  maxAgeSeconds,
  shop,
  storefrontAccessToken,
}: ShopifyProviderOptions): EcommerceProvider {
  let href = `https://${shop}.myshopify.com/api/2021-10/graphql.json`;
  async function query(
    locale: string,
    query: string,
    variables?: any,
    nocache?: boolean
  ) {
    let request = new Request(href, {
      method: "POST",
      headers: {
        "Accept-Language": locale,
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    let maxAge =
      typeof maxAgeSeconds === "function"
        ? maxAgeSeconds(request.clone())
        : maxAgeSeconds;

    if (!nocache && cache && typeof maxAge === "number") {
      return cache(request, maxAge).then((res) => res.json());
    }

    return fetch(request).then((res) => res.json());
  }

  return {
    async getCartInfo(locale, items) {
      let json = await query(locale, getProductVariantsQuery, {
        ids: items.map((item) => item.variantId),
      });

      if (!json?.data?.nodes) {
        return undefined;
      }
      let subtotal = new Decimal(0);
      let itemsMap = new Map(items.map((item) => [item.variantId, item]));
      let fullItems: FullCartItem[] = [];
      for (let item of json.data.nodes) {
        let itemInput = !!item && itemsMap.get(item.id);
        if (!itemInput) {
          continue;
        }

        subtotal = subtotal.plus(
          new Decimal(item.priceV2.amount).times(itemInput.quantity)
        );

        fullItems.push({
          quantity: itemInput.quantity,
          variantId: itemInput.variantId,
          info: {
            defaultVariantId: item.id,
            id: item.product.id,
            formattedPrice: formatPrice(item.priceV2),
            image:
              item.image?.originalSrc ||
              item.product.images.edges[0].node.originalSrc,
            title: item.product.title,
            formattedOptions: item.title,
            slug: item.product.handle,
          },
        });
      }

      if (!fullItems.length) {
        return undefined;
      }

      let formattedSubTotal = formatPrice({
        amount: subtotal.toDecimalPlaces(2).toString(),
        currencyCode: json.data.nodes.find(
          (n: any) => !!n?.priceV2?.currencyCode
        ).priceV2.currencyCode,
      });

      let translations = getTranslations(locale, ["Calculated at checkout"]);

      return {
        formattedShipping: translations["Calculated at checkout"],
        formattedSubTotal: formattedSubTotal,
        formattedTaxes: translations["Calculated at checkout"],
        formattedTotal: formattedSubTotal,
        items: fullItems,
      };
    },
    async getCategories(locale, count, nocache) {
      let json = await query(
        locale,
        getAllCollectionQuery,
        {
          first: count,
        },
        nocache
      );

      let categories = json.data.collections.edges.map(
        ({ node: { title, handle } }: any): Category => ({
          name: title,
          slug: handle,
        })
      );

      return categories;
    },
    async getCheckoutUrl(locale, items) {
      let lineItems = items.map((item) => ({
        quantity: item.quantity,
        merchandiseId: item.variantId,
      }));

      let json = await fetch(href, {
        method: "POST",
        headers: {
          "Accept-Language": locale,
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
        },
        body: JSON.stringify({
          query: createCheckoutUrlMutation,
          variables: { lineItems },
        }),
      }).then((res) => res.json());

      return json.data.cartCreate.cart.checkoutUrl;
    },
    async getFeaturedProducts(locale) {
      let json = await query(locale, getAllProductsQuery, {
        first: 12,
      });

      let products = json.data.products.edges.map(
        ({
          node: { id, handle, title, images, priceRange, variants },
        }: any): Product => ({
          formattedPrice: formatPrice(priceRange.minVariantPrice),
          id,
          defaultVariantId: variants.edges[0].node.id,
          image: images.edges[0].node.originalSrc,
          slug: handle,
          title,
        })
      );

      return products;
    },
    async getPage(locale, slug) {
      let json = await query(locale, getPageQuery, { query: `handle:${slug}` });
      let page = json.data.pages.edges[0]?.node;
      if (!page) {
        return undefined;
      }

      return {
        body: page.body,
        id: page.id,
        slug: page.handle,
        summary: page.bodySummary,
        title: page.title,
      };
    },
    async getPages(locale) {
      let json = await query(locale, getAllPagesQuery);
      return json.data.pages.edges.map(
        ({ node: { id, handle, title } }: any): Page => ({
          id,
          slug: handle,
          title,
        })
      );
    },
    async getProduct(locale, slug, selectedOptions) {
      let json = await query(locale, getProductQuery, { slug });

      if (!json.data.productByHandle) {
        return undefined;
      }

      let {
        id,
        handle,
        title,
        description,
        descriptionHtml,
        images,
        priceRange,
        options,
        variants,
      } = json.data.productByHandle;

      let optionNames = new Set(options.map((o: any) => o.name));
      let optionsMap = new Map(
        selectedOptions
          ?.filter((option) => optionNames.has(option.name))
          .map((option) => [option.name, option.value])
      );

      let defaultVariantId: string | undefined = undefined;
      let selectedVariantId: string | undefined;
      let availableForSale = false;
      let price = priceRange.minVariantPrice;
      for (let { node } of variants.edges) {
        if (typeof defaultVariantId === "undefined") {
          defaultVariantId = node.id;
        }
        if (
          node.selectedOptions.every(
            (option: any) =>
              optionsMap.has(option.name) &&
              optionsMap.get(option.name) === option.value
          )
        ) {
          selectedVariantId = node.id;
          availableForSale = node.availableForSale;
          price = node.priceV2;
        }
      }

      return {
        formattedPrice: formatPrice(price),
        id,
        defaultVariantId: defaultVariantId!,
        image: images.edges[0].node.originalSrc,
        images: images.edges.map(
          ({ node: { originalSrc } }: any) => originalSrc
        ),
        slug: handle,
        title,
        description,
        descriptionHtml,
        selectedVariantId,
        availableForSale,
        options: options.map((option: any) => ({
          name: option.name,
          values: option.values,
        })),
      };
    },
    async getProducts(
      locale,
      category,
      sort,
      search,
      cursor,
      perPage = 30,
      nocache
    ) {
      let q = "";
      if (search) {
        q += `product_type:${search} OR title:${search} OR tag:${search} `;
        category = undefined;
      }

      let sortVariables = {};
      switch (sort) {
        case "price-asc":
          sortVariables = {
            sortKey: "PRICE",
            reverse: false,
          };
          break;
        case "price-desc":
          sortVariables = {
            sortKey: "PRICE",
            reverse: true,
          };
          break;
        case "trending-desc":
          sortVariables = {
            sortKey: "BEST_SELLING",
            reverse: false,
          };
          break;
        case "latest-desc":
          sortVariables = {
            sortKey: category ? "CREATED" : "CREATED_AT",
            reverse: true,
          };
          break;
      }

      let json = await query(
        locale,
        category ? getCollectionProductsQuery : getAllProductsQuery,
        {
          ...sortVariables,
          first: perPage,
          query: q,
          collection: category,
          cursor,
        },
        nocache
      );

      let productsInfo = category
        ? json.data.collections.edges[0]?.node.products
        : json.data.products;

      let { edges, pageInfo } = productsInfo;

      let nextPageCursor: string | undefined = undefined;
      let products =
        edges?.map(
          ({
            cursor,
            node: { id, handle, title, images, priceRange, variants },
          }: any): Product => {
            nextPageCursor = cursor;
            return {
              formattedPrice: formatPrice(priceRange.minVariantPrice),
              id,
              defaultVariantId: variants.edges[0].node.id,
              image: images.edges[0].node.originalSrc,
              slug: handle,
              title,
            };
          }
        ) || [];

      return { hasNextPage: pageInfo.hasNextPage, nextPageCursor, products };
    },
    async getSortByOptions(locale) {
      let translations = getTranslations(locale, [
        "Trending",
        "Latest arrivals",
        "Price: Low to high",
        "Price: High to low",
      ]);
      return [
        {
          label: translations.Trending,
          value: "trending-desc",
        },
        {
          label: translations["Latest arrivals"],
          value: "latest-desc",
        },
        {
          label: translations["Price: Low to high"],
          value: "price-asc",
        },
        {
          label: translations["Price: High to low"],
          value: "price-desc",
        },
      ];
    },
    async getWishlistInfo(locale, items) {
      let json = await query(locale, getProductVariantsQuery, {
        ids: items.map((item) => item.variantId),
      });

      if (!json?.data?.nodes) {
        return undefined;
      }

      let itemsMap = new Map(items.map((item) => [item.variantId, item]));
      let fullItems: FullWishlistItem[] = [];
      for (let item of json.data.nodes) {
        let itemInput = !!item && itemsMap.get(item.id);
        if (!itemInput) {
          continue;
        }

        fullItems.push({
          productId: item.product.id,
          quantity: itemInput.quantity,
          variantId: itemInput.variantId,
          info: {
            defaultVariantId: item.id,
            id: item.product.id,
            formattedPrice: formatPrice(item.priceV2),
            image:
              item.image?.originalSrc ||
              item.product.images.edges[0].node.originalSrc,
            title: item.product.title,
            formattedOptions: item.title,
            slug: item.product.handle,
          },
        });
      }

      if (!fullItems.length) {
        return undefined;
      }

      return fullItems;
    },
  };
}

function formatPrice({
  amount,
  currencyCode,
}: {
  amount: string;
  currencyCode: string;
}) {
  return `$${amount} ${currencyCode}`;
}

let createCheckoutUrlMutation = /* GraphQL */ `
  mutation calculateCart($lineItems: [CartLineInput!]) {
    cartCreate(input: { lines: $lineItems }) {
      cart {
        checkoutUrl
      }
    }
  }
`;

let getProductVariantsQuery = /* GraphQL */ `
  query getProductVariantsQuery($ids: [ID!]!) {
    nodes(ids: $ids) {
      id
      ... on ProductVariant {
        title
        image {
          originalSrc
        }
        priceV2 {
          amount
          currencyCode
        }
        product {
          id
          title
          handle
          images(first: 1) {
            edges {
              node {
                originalSrc
              }
            }
          }
        }
      }
    }
  }
`;

let getAllCollectionQuery = /* GraphQL */ `
  query getSiteCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          title
          handle
        }
      }
    }
  }
`;

let getAllPagesQuery = /* GraphQL */ `
  query getAllPages($first: Int = 250) {
    pages(first: $first) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

let getPageQuery = /* GraphQL */ `
  query getPage($query: String) {
    pages(first: 1, query: $query) {
      edges {
        node {
          id
          handle
          title
          body
          bodySummary
        }
      }
    }
  }
`;

let productConnectionFragment = /* GraphQL */ `
  fragment productConnection on ProductConnection {
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    edges {
      cursor
      node {
        id
        title
        vendor
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            node {
              originalSrc
              altText
              width
              height
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`;

let getAllProductsQuery = /* GraphQL */ `
  query getAllProducts(
    $first: Int = 20
    $query: String = ""
    $sortKey: ProductSortKeys = RELEVANCE
    $reverse: Boolean = false
    $cursor: String
  ) {
    products(
      first: $first
      sortKey: $sortKey
      reverse: $reverse
      query: $query
      after: $cursor
    ) {
      ...productConnection
    }
  }
  ${productConnectionFragment}
`;

let getCollectionProductsQuery = /* GraphQL */ `
  query getProductsFromCollection(
    $collection: String
    $first: Int = 20
    $sortKey: ProductCollectionSortKeys = RELEVANCE
    $reverse: Boolean = false
    $cursor: String
  ) {
    collections(first: 1, query: $collection) {
      edges {
        node {
          handle
          products(
            first: $first
            sortKey: $sortKey
            reverse: $reverse
            after: $cursor
          ) {
            ...productConnection
          }
        }
      }
    }
  }
  ${productConnectionFragment}
`;

let getProductQuery = /* GraphQL */ `
  query getProductBySlug($slug: String!) {
    productByHandle(handle: $slug) {
      id
      handle
      availableForSale
      title
      description
      descriptionHtml
      options {
        id
        name
        values
      }
      priceRange {
        maxVariantPrice {
          amount
          currencyCode
        }
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 250) {
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        edges {
          node {
            id
            title
            sku
            availableForSale
            requiresShipping
            selectedOptions {
              name
              value
            }
            priceV2 {
              amount
              currencyCode
            }
            compareAtPriceV2 {
              amount
              currencyCode
            }
          }
        }
      }
      images(first: 20) {
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        edges {
          node {
            originalSrc
            altText
            width
            height
          }
        }
      }
    }
  }
`;
