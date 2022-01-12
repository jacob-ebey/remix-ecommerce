import { createHash } from "crypto";
import { createClient } from "redis";

import type { RequestResponseCache } from "../request-response-cache.server";

type CachedResponse = {
  status: number;
  statusText: string;
  body: string;
  headers: [string, string][];
};

export let createSwrRedisCache = ({
  redisClient,
}: {
  redisClient: ReturnType<typeof createClient>;
}): RequestResponseCache => {
  let connectionPromise: Promise<void>;
  if (!redisClient.isOpen) {
    connectionPromise = redisClient.connect();
  }

  return async (request, maxAgeSeconds) => {
    await connectionPromise;

    let method = request.method.toLowerCase();

    let hash = createHash("sha256");
    hash.update(method);
    hash.update(request.url);
    for (let header of request.headers) {
      hash.update(header[0]);
      hash.update(header[1]);
    }
    let body: string | null = null;
    if (method !== "get" && method !== "head" && request.body) {
      body = await request.clone().text();
    }
    if (typeof body === "string") {
      hash.update(body);
    }
    let key = hash.digest("hex");

    let stillGoodKey = `swr:stillgood:${key}`;
    let responseKey = `swr:response:${key}`;

    let cachedStillGoodPromise = redisClient
      .get(stillGoodKey)
      .then((cachedStillGood) => {
        if (!cachedStillGood) {
          return false;
        }
        return true;
      })
      .catch(() => false);

    let response = await redisClient
      .get(responseKey)
      .then(async (cachedResponseString) => {
        if (!cachedResponseString) {
          return null;
        }

        let cachedResponseJson = JSON.parse(
          cachedResponseString
        ) as CachedResponse;

        if (cachedResponseJson.status !== 200) {
          return null;
        }

        let cachedResponse = new Response(cachedResponseJson.body, {
          status: cachedResponseJson.status,
          statusText: cachedResponseJson.statusText,
          headers: cachedResponseJson.headers,
        });

        if (await cachedStillGoodPromise) {
          cachedResponse.headers.set("X-SWR-Cache", "hit");
        } else {
          cachedResponse.headers.set("X-SWR-Cache", "stale");

          (async () => {
            let responseToCache = await fetch(request.clone());
            if (responseToCache.status === 200) {
              let toCache: CachedResponse = {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: Array.from(responseToCache.headers),
                body: await responseToCache.text(),
              };

              await redisClient.set(responseKey, JSON.stringify(toCache));
              await redisClient.setEx(stillGoodKey, maxAgeSeconds, "true");
            }
          })().catch((error) => {
            console.error("Failed to revalidate", error);
          });
        }

        return cachedResponse;
      })
      .catch(() => null);

    if (!response) {
      response = await fetch(request.clone());
      let responseToCache = response.clone();
      response.headers.set("X-SWR-Cache", "miss");

      if (responseToCache.status === 200) {
        (async () => {
          let toCache: CachedResponse = {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: Array.from(responseToCache.headers),
            body: await responseToCache.text(),
          };

          await redisClient.set(responseKey, JSON.stringify(toCache));
          await redisClient.setEx(stillGoodKey, maxAgeSeconds, "true");
        })().catch((error) => {
          console.error("Failed to seed cache", error);
        });
      }
    }

    return response;
  };
};
