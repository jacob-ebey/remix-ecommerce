import { json } from "remix";
import type { LoaderFunction } from "remix";

import commerce from "~/commerce.server";
import { getSession } from "~/session.server";
import type { FullPage } from "~/models/ecommerce-provider.server";

export type LoaderData = {
  page: FullPage;
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let session = await getSession(request, params);
  let lang = session.getLanguage();

  let page = await commerce.getPage(lang, params["*"]!);

  if (!page) {
    throw json("Page not found", { status: 404 });
  }

  return json<LoaderData>({
    page,
  });
};
