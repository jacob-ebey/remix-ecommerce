import { renderToString } from "react-dom/server";
import { RemixServer } from "remix";
import type { EntryContext } from "remix";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html");
  if (process.env.FLY_REGION) {
    responseHeaders.set("X-Fly-Region", process.env.FLY_REGION);
  }

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
