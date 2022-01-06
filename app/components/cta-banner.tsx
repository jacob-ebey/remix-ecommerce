import type { ReactNode } from "react";
import { Link } from "remix";
import type { To } from "react-router-dom";
import cn from "classnames";

export function CtaBanner({
  ctaText,
  ctaTo,
  description,
  headline,
  variant = "primary",
}: {
  ctaText: ReactNode;
  ctaTo: To;
  description: ReactNode;
  headline: ReactNode;
  variant: "primary" | "secondary";
}) {
  return (
    <article
      className={cn(
        "px-4 lg:px-6 py-24 lg:py-32 lg:flex",
        variant === "secondary" && "bg-gray-50 text-zinc-900 border-t border-zinc-700"
      )}
    >
      <h1 className="text-6xl font-bold max-w-lg lg:text-right">{headline}</h1>
      <div className="flex-1 mt-3 lg:ml-8">
        <p className="text-xl font-light mb-4">{description}</p>
        <p>
          <Link className="group inline-flex items-center" prefetch="intent" to={ctaTo}>
            <span className="text-xl font-semibold group-focus:underline group-hover:underline focus:underline hover:underline">
              {ctaText}
            </span>
            <svg
              className="h-6 w-6 motion-safe:group-focus:animate-pulse motion-safe:group-hover:animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </p>
      </div>
    </article>
  );
}
