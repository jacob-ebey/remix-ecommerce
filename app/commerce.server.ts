import { createShopifyProvider } from "./models/ecommerce-providers/shopify.server";
import { createSwrRedisCache } from "./models/request-response-caches/swr-redis-cache.server";

import redisClient from "./redis.server";
import { createVendureProvider } from '~/models/ecommerce-providers/vendure.server';

let commerce = createVendureProvider({
  shop: process.env.SHOPIFY_STORE!,
  maxAgeSeconds: 60,
  cache: createSwrRedisCache({
    redisClient,
  }),
});

export default commerce;
