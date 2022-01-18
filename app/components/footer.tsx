import { Fragment } from "react";
import { Form, Link, useLocation } from "remix";
import type { To } from "react-router-dom";
import { Popover, Transition } from "@headlessui/react";
import cn from "classnames";

import { Language } from "~/models/language";

import { MexicoFlag, UnitedStatesFlag } from "./flags";
import { ChevronUp, GithubIcon } from "./icons";
import { OptimizedImage } from "./optimized-image";

export type FooterPage = {
  id: string;
  title: string;
  to: To;
};

export function Footer({
  lang,
  logoHref,
  pages,
  storeName,
}: {
  lang: Language;
  logoHref: string;
  pages: FooterPage[];
  storeName?: string;
}) {
  let location = useLocation();

  return (
    <footer>
      <div className="lg:flex border-t border-zinc-700 px-4 lg:px-6 py-16">
        <div className="lg:mr-20 mb-6">
          <div className="flex items-center flex-1">
            <OptimizedImage
              className="w-10 h-10"
              src={logoHref}
              alt=""
              width={40}
              height={40}
            />
            {storeName ? (
              <h1 className="ml-4 text-lg font-semibold">{storeName}</h1>
            ) : null}
          </div>
        </div>
        <ul className="max-w-lg mr-auto flex-1 grid gap-4 md:grid-rows-4 md:grid-flow-col mb-6">
          {pages.map((page) => (
            <li key={page.id}>
              <Link
                className="focus:text-gray-300 hover:text-gray-300"
                prefetch="intent"
                to={page.to}
              >
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
        <div>
          <div className="flex items-center">
            <a
              className="inline-block focus:text-gray-300 hover:text-gray-300 mr-4"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">View source</span>
              <GithubIcon className="w-8 h-8" />
            </a>
            <Popover
              className="relative inline-block"
              as={Form}
              method="post"
              action="/actions/set-language"
              replace
            >
              {({ open, close }) => (
                <>
                  <input
                    type="hidden"
                    name="redirect"
                    value={location.pathname + location.search}
                  />

                  <Popover.Button
                    data-testid="language-selector"
                    className="inline-flex items-center p-2 border border-zinc-700 rounded"
                  >
                    <span className="sr-only">Change language</span>
                    {(() => {
                      switch (lang) {
                        case "es":
                          return (
                            <MexicoFlag className="w-6 h-6 rounded-full" />
                          );
                        default:
                          return (
                            <UnitedStatesFlag className="w-6 h-6 rounded-full" />
                          );
                      }
                    })()}
                    <ChevronUp
                      className={cn(
                        "ml-2 w-6 h-6 transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Popover.Panel className="absolute z-10 bottom-full left-0 lg:left-auto lg:right-0 min-w-max bg-zinc-800 p-2 rounded">
                      <ul>
                        <li>
                          <button
                            name="lang"
                            value="en"
                            className="flex w-full items-center p-2 focus:bg-zinc-900 hover:bg-zinc-900"
                            onClick={() => close()}
                          >
                            <UnitedStatesFlag className="w-6 h-6 rounded-full" />
                            <span className="ml-2">English</span>
                          </button>
                        </li>
                        <li>
                          <button
                            name="lang"
                            value="es"
                            className="flex w-full items-center p-2 focus:bg-zinc-900 hover:bg-zinc-900"
                            onClick={() => close()}
                          >
                            <MexicoFlag className="w-6 h-6 rounded-full" />
                            <span className="ml-2">Español</span>
                          </button>
                        </li>
                      </ul>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-700 px-4 lg:px-6 py-8">
        <p className="text-sm text-gray-300">
          © 2022 {storeName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
