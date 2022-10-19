import { type LoaderArgs } from "@remix-run/node";
import { imageLoader, DiskCache, fetchResolver } from "remix-image/server";
import { sharpTransformer } from "remix-image-sharp";

export function loader({ request }: LoaderArgs) {
  let url = new URL("/", request.url);

  return imageLoader(
    {
      selfUrl: url.href,
      cache: new DiskCache({
        path: ".cache/images",
      }),
      resolver: async (asset, url, options, basePath) => {
        return await fetchResolver(asset, url, options, basePath);
      },
      transformer: sharpTransformer,
    },
    request
  );
}
