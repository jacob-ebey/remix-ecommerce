import { Fragment, useEffect, useState } from "react";
import { Form, useLocation } from "remix";
import { Dialog, Transition } from "@headlessui/react";

import { Language, validateLanguage } from "~/models/language";

import { PickTranslations } from "~/translations.server";

export function LanguageDialog({
  lang,
  translations,
}: {
  lang: Language;
  translations: PickTranslations<
    | "Looks like your language doesn't match"
    | "Would you like to switch to $1?"
    | "Yes"
    | "No"
  >;
}) {
  let location = useLocation();
  let [browserLang, setBrowserLang] = useState<Language | null>(null);
  let closeLangModal = () => setBrowserLang(null);
  useEffect(() => {
    let modalShown = localStorage.getItem("lang-modal-shown");
    let shouldShowModal = location.pathname === "/";
    if (!modalShown && shouldShowModal) {
      let browserLang = navigator.language.split("-", 2)[0].toLowerCase();
      if (
        !modalShown &&
        browserLang !== lang &&
        validateLanguage(browserLang)
      ) {
        setBrowserLang(browserLang);
        localStorage.setItem("lang-modal-shown", "1");
      }
    }
  }, [lang, location]);

  return (
    <Transition appear show={!!browserLang} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={closeLangModal}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-zinc-800 shadow-xl rounded-2xl">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6">
                {translations?.["Looks like your language doesn't match"]}
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm">
                  {translations?.["Would you like to switch to $1?"].replace(
                    "$1",
                    browserLang?.toUpperCase() || ""
                  )}
                </p>
              </div>

              <Form
                className="mt-4"
                method="post"
                action={`/actions/set-language`}
              >
                <input
                  type="hidden"
                  name="lang"
                  value={browserLang || undefined}
                />
                <button
                  type="submit"
                  className="inline-flex mr-2 justify-center px-4 py-2 text-sm font-medium text-white bg-pink-brand focus:bg-pink-600 hover:bg-pink-600 rounded-md"
                  onClick={closeLangModal}
                >
                  {translations.Yes}
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-brand focus:bg-red-600 hover:bg-red-600 rounded-md"
                  onClick={closeLangModal}
                >
                  {translations.No}
                </button>
              </Form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
