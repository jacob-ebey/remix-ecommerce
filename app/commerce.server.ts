import { createShopifyProvider } from "./models/ecommerce-providers/shopify.server";
import { createSwrRedisCache } from "./models/request-response-caches/swr-redis-cache.server";

import redisClient from "./redis.server";

if (!process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  throw new Error(
    "SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable is not set"
  );
}

let commerce = createShopifyProvider({
  shop: process.env.SHOPIFY_STORE!,
  storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  maxAgeSeconds: 60,
  cache: createSwrRedisCache({
    redisClient,
  }),
});

export default commerce;
