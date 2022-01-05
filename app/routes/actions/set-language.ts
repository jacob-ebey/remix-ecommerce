import { redirect } from "remix";
import type { ActionFunction, LoaderFunction } from "remix";

import { getSession } from "~/session.server";
import { validateLanguage } from "~/models/language";

export let action: ActionFunction = async ({ request, params }) => {
  let [session, body] = await Promise.all([
    getSession(request, params),
    request.text(),
  ]);

  let formData = new URLSearchParams(body);
  let lang = formData.get("lang");
  let redirectTo = formData.get("redirect");

  if (!redirectTo?.startsWith("/")) {
    redirectTo = "/";
  }

  if (validateLanguage(lang)) {
    session.setLanguage(lang);

    let [, urlLang] = redirectTo.split("/", 2);
    if (validateLanguage(urlLang)) {
      redirectTo = redirectTo.replace(`/${urlLang}`, `/${lang}`);
    } else {
      redirectTo = `/${lang}${redirectTo}`;
    }
  }

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await session.commitSession(),
    },
  });
};

export let loader: LoaderFunction = () => {
  return redirect("/");
};
