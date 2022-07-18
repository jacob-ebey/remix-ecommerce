import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import commerce from "~/commerce.server";
import { getSession } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  let session = await getSession(request, params);
  let lang = session.getLanguage();

  let page = await commerce.getPage(lang, params["*"]!);

  if (!page) {
    throw json("Page not found", { status: 404 });
  }

  return json({
    page,
  });
}
