export function GenericErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <div className="py-16">
      <div className="prose prose-invert text-gray-50 max-w-xl mx-auto px-4">
        <h1>An unknown error occured.</h1>
      </div>
    </div>
  );
}
