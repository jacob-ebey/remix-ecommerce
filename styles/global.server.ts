import fsp from "fs/promises";
import type { LoaderFunction } from "remix";
import postcss from "postcss";
import postcssrc from "postcss-load-config";

export let loader: LoaderFunction = async () => {
  let { options, plugins } = await postcssrc();

  let { css } = await postcss(plugins).process(
    await fsp.readFile("styles/global.css", "utf8"),
    { ...options, from: "styles/global.css" }
  );

  return new Response(css, {
    headers: {
      "Content-Type": "text/css",
    },
  });
};
