import { createHash } from "crypto";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import https from "https";
import { PassThrough } from "stream";
import type { Readable } from "stream";
import type { LoaderFunction } from "remix";
import sharp from "sharp";
import type { Request as NodeRequest } from "@remix-run/node";
import { Response as NodeResponse } from "@remix-run/node";

let badImageBase64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function badImageResponse() {
  let buffer = Buffer.from(badImageBase64, "base64");
  return new Response(buffer, {
    status: 500,
    headers: {
      "Cache-Control": "max-age=0",
      "Content-Type": "image/gif;base64",
      "Content-Length": buffer.length.toFixed(0),
    },
  });
}

function getIntOrNull(value: string | null) {
  if (value === null) {
    return null;
  }

  return Number.parseInt(value);
}

export let loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);

  let src = url.searchParams.get("src");
  if (!src) {
    return badImageResponse();
  }

  let width = getIntOrNull(url.searchParams.get("width"));
  let height = getIntOrNull(url.searchParams.get("height"));
  let fit: any = url.searchParams.get("fit") || "cover";

  let hash = createHash("sha256");
  hash.update("v1");
  hash.update(request.method);
  hash.update(request.url);
  hash.update(width?.toString() || "0");
  hash.update(height?.toString() || "0");
  hash.update(fit);
  let key = hash.digest("hex");
  let cachedFile = path.resolve(path.join(".cache/images", key + ".webp"));

  try {
    let exists = await fsp
      .stat(cachedFile)
      .then((s) => s.isFile())
      .catch(() => false);

    if (exists) {
      let fileStream = fs.createReadStream(cachedFile);

      return new NodeResponse(fileStream, {
        status: 200,
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }) as unknown as Response;
    } else {
      console.info("cache skipped for", src);
    }
  } catch (error) {
    console.error(error);
  }

  try {
    let imageBody: Readable | undefined;
    let status = 200;

    if (src.startsWith("/") && (src.length === 1 || src[1] !== "/")) {
      imageBody = fs.createReadStream(path.resolve("public", src.slice(1)));
    } else {
      let imgRequest = new Request(src.toString()) as unknown as NodeRequest;
      imgRequest.agent = new https.Agent({
        rejectUnauthorized: false,
      });
      let imageResponse = await fetch(imgRequest as unknown as Request);
      imageBody = imageResponse.body as unknown as PassThrough;
      status = imageResponse.status;
    }

    if (!imageBody) {
      return badImageResponse();
    }

    let sharpInstance = sharp();
    sharpInstance.on("error", (error) => {
      console.error(error);
    });

    if (width || height) {
      sharpInstance.resize(width, height, { fit });
    }
    sharpInstance.webp({ reductionEffort: 6 });

    let imageManipulationStream = imageBody.pipe(sharpInstance);

    await fsp
      .mkdir(path.dirname(cachedFile), { recursive: true })
      .catch(() => {});
    let cacheFileStream = fs.createWriteStream(cachedFile);

    await new Promise<void>((resolve, reject) => {
      imageManipulationStream.pipe(cacheFileStream);
      imageManipulationStream.on("end", () => {
        resolve();
        imageBody!.destroy();
      });
      imageManipulationStream.on("error", async (error) => {
        imageBody!.destroy();
        await fsp.rm(cachedFile).catch(() => {});
      });
    });

    let fileStream = fs.createReadStream(cachedFile);

    return new NodeResponse(fileStream, {
      status: status,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }) as unknown as Response;
  } catch (error) {
    console.error(error);
    return badImageResponse();
  }
};
