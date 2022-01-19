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

export interface VendureProviderOptions {
    cache?: RequestResponseCache;
    maxAgeSeconds?: number | ((request: Request) => number);
    shop: string;
}

export function createVendureProvider({
                                          cache,
                                          maxAgeSeconds,
                                          shop,
                                      }: VendureProviderOptions): EcommerceProvider {
    let href = `https://demo.vendure.io/shop-api`;

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
            },
            body: JSON.stringify({query, variables}),
        });

        let maxAge =
            typeof maxAgeSeconds === "function"
                ? maxAgeSeconds(request.clone())
                : maxAgeSeconds;

        if (!nocache && cache && typeof maxAge === "number") {
            return cache(request, maxAge).then((res) => res.json());
        }

        const result = await fetch(request).then((res) => res.json());
        if (result.errors?.length) {
            throw new Error(result.errors[0].message);
        }
        return result;
    }

    return {
        async getCartInfo(locale, items) {
            const productIds = items.map((item) => item.variantId.split('_')[0]);
            console.log(`productIds`, productIds);
            let json = await query(locale, getProductsByIds, {
                ids: productIds,
            }, true);

            if (!json?.data?.products) {
                return undefined;
            }
            let subtotal = new Decimal(0);
            let currencyCode: string;
            let itemsMap = new Map(items.map((item) => [item.variantId, item]));
            let fullItems: FullCartItem[] = [];
            for (let item of items) {
                const [productId, variantId] = item.variantId.split('_');
                const product = json.data.products.items.find((product: any) => product.id === productId);
                if (!product) {
                    continue;
                }
                const variant = product.variants.find((variant: any) => variant.id === variantId);
                if (!variant) {
                    continue;
                }
                subtotal = subtotal.plus(
                    new Decimal(variant.priceWithTax).times(item.quantity)
                );
                currencyCode = variant.currencyCode;

                fullItems.push({
                    quantity: item.quantity,
                    variantId: item.variantId,
                    info: {
                        defaultVariantId: variantId,
                        id: productId,
                        formattedPrice: formatPrice(variant.priceWithTax, currencyCode, locale),
                        image: product.featuredAsset.preview + '?preset=thumb',
                        title: product.name,
                        formattedOptions: variant.name,
                        slug: product.slug,
                    },
                });
            }

            if (!fullItems.length) {
                return undefined;
            }

            let formattedSubTotal = formatPrice(+subtotal.toString(), currencyCode!, locale);
            let translations = getTranslations(locale, ["Calculated at checkout"]);

            return {
                formattedShipping: translations["Calculated at checkout"],
                formattedSubTotal: formattedSubTotal,
                formattedTaxes: translations["Calculated at checkout"],
                formattedTotal: formattedSubTotal,
                items: fullItems,
            };
        },
        // async getCartInfo(locale, items) {
        //     let json = await query(locale, getCart);
        //     if (!json?.data?.activeOrder) {
        //         return undefined;
        //     }
        //     let activeOrder = json.data.activeOrder;
        //     let fullItems: FullCartItem[] = [];
        //     for (let item of activeOrder.lines) {
        //         fullItems.push({
        //             quantity: item.quantity,
        //             variantId: item.productVariant.id,
        //             info: {
        //                 defaultVariantId: item.productVariant.id,
        //                 id: item.product.id,
        //                 formattedPrice: formatPrice(item.linePriceWithTax, activeOrder.currencyCode, locale),
        //                 image: item.featuredAsset.preview,
        //                 title: item.productVariant.product.name,
        //                 formattedOptions: item.productVariant.options.map((o: any) => name).join(', '),
        //                 slug: item.productVariant.product.slug,
        //             },
        //         });
        //     }
        //
        //     if (!fullItems.length) {
        //         return undefined;
        //     }
        //
        //     let formattedSubTotal = formatPrice(
        //         activeOrder.subTotal,
        //         activeOrder.currencyCode,
        //         locale,
        //     );
        //
        //     let translations = getTranslations(locale, ["Calculated at checkout"]);
        //
        //     return {
        //         formattedShipping: translations["Calculated at checkout"],
        //         formattedSubTotal: formattedSubTotal,
        //         formattedTaxes: translations["Calculated at checkout"],
        //         formattedTotal: formattedSubTotal,
        //         items: fullItems,
        //     };
        // },
        async getCategories(locale, count, nocache) {
            let json = await query(
                locale,
                getAllCollectionQuery,
                {
                    first: Math.min(count, 100),
                },
                nocache
            );
            return json.data.collections.items.filter((collection: any) => {
                return collection.parent.name === '__root_collection__';
            });
        },
        async getCheckoutUrl(locale, items) {
            return '';
        },
        async getFeaturedProducts(locale) {
            let json = await query(locale, searchProducts, {
                first: 12,
            });

            let products = json.data.search.items.map(
                (item: any): Product => ({
                    formattedPrice: formatPrice(item.priceWithTax.min, item.currencyCode, locale),
                    id: item.id,
                    defaultVariantId: item.productVariantId,
                    image: item.productAsset.preview,
                    slug: item.slug,
                    title: item.productName,
                })
            );

            return products;
        },
        async getPage(locale, slug) {
            return undefined;
        },
        async getPages(locale) {
            return [];
        },
        async getProduct(locale, slug, selectedOptions) {
            let json = await query(locale, getProductQuery, {slug});

            console.log(selectedOptions);
            if (!json.data.product) {
                return undefined;
            }

            let product = json.data.product;

            let optionNames = new Set(product.optionGroups.map((o: any) => o.name));
            let optionsMap = new Map(
                selectedOptions
                    ?.filter((option) => optionNames.has(option.name))
                    ?.map((option) => [option.name, option.value])
            );

            let defaultVariantId: string | undefined = undefined;
            let selectedVariantId: string | undefined;
            let availableForSale = false;
            let price = Math.min(...product.variants.map((v: any) => v.priceWithTax));
            for (let variant of product.variants) {
                if (typeof defaultVariantId === "undefined") {
                    defaultVariantId = variant.id;
                }
                if (
                    variant.options.every(
                        (option: any) =>
                            optionsMap.has(option.group.name) &&
                            optionsMap.get(option.group.name) === option.name
                    )
                ) {
                    selectedVariantId = `${product.id}_${variant.id}`;
                    availableForSale = variant.stockLevel !== 'OUT_OF_STOCK';
                    price = variant.priceWithTax;
                }
            }

            return {
                formattedPrice: formatPrice(price, product.variants[0].currencyCode, locale),
                id: product.id,
                defaultVariantId: defaultVariantId!,
                image: product.featuredAsset.preview,
                images: product.assets.map((asset: any) => asset.preview),
                slug: product.slug,
                title: product.name,
                description: product.description,
                descriptionHtml: product.description,
                selectedVariantId,
                availableForSale,
                options: product.optionGroups.map((group: any) => ({
                    name: group.name,
                    values: group.options.map((option: any) => option.name),
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
                q = search;
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
            }

            let json = await query(
                locale,
                searchProducts,
                {
                    ...sortVariables,
                    first: perPage,
                    query: q,
                    collection: category,
                    cursor,
                },
                nocache
            );

            let {items, totalItems} = json.data.search;

            let nextPageCursor: string | undefined = undefined;
            let hasNextPage = false;
            let products =
                items.map(
                    (item: any): Product => {
                        return {
                            formattedPrice: formatPrice(item.priceWithTax.min, item.currencyCode, locale),
                            id: item.productId,
                            defaultVariantId: item.productVariantId,
                            image: item.productAsset.preview,
                            slug: item.slug,
                            title: item.productName,
                        };
                    }
                ) || [];

            return {hasNextPage, nextPageCursor, products};
        },
        async getSortByOptions(locale) {
            let translations = getTranslations(locale, [
                "Price: Low to high",
                "Price: High to low",
            ]);
            return [
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
            return [];
        },
    };
}

function formatPrice(
    amount: number,
    currencyCode: string,
    locale: string,
) {
    const majorUnits = amount / 100;
    return new Intl.NumberFormat(locale, {style: 'currency', currency: currencyCode}).format(
        majorUnits,
    );
}

let getProductsByIds = /* GraphQL */ `
    query getProductByIds($ids: [String!]!) {
        products(options: { filter: { id: { in: $ids }}}) {
            items {
                id
                slug
                featuredAsset {
                    preview
                }
                variants {
                    id
                    name
                    currencyCode
                    priceWithTax
                }
            }
        }
    }
`;

let getCart = /* GraphQL */ `
    query activeOrder {
        activeOrder {
            id
            lines {
                featuredAsset {
                    preview
                }
                productVariant {
                    id
                    name
                    product {
                        id
                        slug
                        name
                    }
                    options {
                        name
                    }
                }
                quantity
                linePriceWithTax
            }
            currencyCode
            subTotal
            shipping
            totalWithTax
        }
    }
`;

let getAllCollectionQuery = /* GraphQL */ `
    query getSiteCollections($first: Int!) {
        collections(options: { take: $first }) {
            items {
                name
                slug
                parent {
                    id
                    name
                }
            }
        }
    }
`;

let searchResult = /* GraphQL */ `
    fragment searchResult on SearchResult {
        productId
        productName
        productVariantId
        slug
        productAsset {
            id
            preview
        }
        currencyCode
        priceWithTax {
            ...on PriceRange {
                min
                max
            }
            ...on SinglePrice {
                value
            }
        }
    }
`;

let searchProducts = /* GraphQL */ `
    query searchProducts(
        $first: Int = 20
        $query: String
        $collectionSlug: String
    ) {
        search(
            input: {
                term: $query
                collectionSlug: $collectionSlug
                groupByProduct: true
                take: $first
            }
        ) {
            totalItems
            items {
                ...searchResult
            }
        }
    }
    ${searchResult}
`;

let getProductQuery = /* GraphQL */ `
    query getProductBySlug($slug: String) {
        product(slug: $slug) {
            id
            slug
            name
            description
            optionGroups {
                id
                name
                code
                options {
                    id
                    name
                    code
                }
            }
            variants {
                id
                name
                sku
                stockLevel
                options {
                    name
                    code
                    group {
                        code
                        name
                    }
                }
                price
                priceWithTax
                currencyCode
            }
            featuredAsset {
                id
                name
                preview
            }
            assets {
                id
                name
                preview
            }
        }
    }
`;
