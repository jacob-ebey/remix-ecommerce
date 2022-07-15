import { useLoaderData } from "@remix-run/react";
import { UseDataFunctionReturn } from "@remix-run/react/dist/components";

import type { loader } from "./generic-page.server";

export const meta = ({
  data,
}: {
  data?: UseDataFunctionReturn<typeof loader>;
}) => {
  return data?.page?.title
    ? {
        title: data.page.title,
        description: data.page.summary,
      }
    : {
        title: "Remix Ecommerce",
        description: "An example ecommerce site built with Remix.",
      };
};

export default function GenericPage() {
  let {
    page: { body },
  } = useLoaderData<typeof loader>();
  return (
    <div className="py-16">
      <div
        className="max-w-xl px-4 mx-auto prose prose-invert text-gray-50"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}
