import { useLoaderData } from "remix";

import type { LoaderData } from "./generic-page.server";

export const meta = ({ data }: { data?: LoaderData }) => {
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
  } = useLoaderData<LoaderData>();
  return (
    <div className="py-16">
      <div
        className="prose prose-invert text-gray-50 max-w-xl mx-auto px-4"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}
