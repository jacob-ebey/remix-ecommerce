import { useCatch } from "remix";

export function GenericCatchBoundary() {
  let caught = useCatch();
  let message = caught.statusText;
  if (typeof caught.data === "string") {
    message = caught.data;
  }

  return (
    <div className="py-16">
      <div className="prose prose-invert text-gray-50 max-w-xl mx-auto px-4">
        <h1>{message}</h1>
      </div>
    </div>
  );
}
