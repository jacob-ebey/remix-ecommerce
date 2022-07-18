import { Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";

import type { FullWishlistItem } from "~/models/ecommerce-provider.server";
import { PickTranslations } from "~/translations.server";

import { CloseIcon, WishlistIcon } from "./icons";

import { WishlistListItem } from "./wishlist-listitem";

export function WishlistPopover({
  wishlist,
  open,
  onClose,
  translations,
}: {
  wishlist?: FullWishlistItem[] | null;
  open: boolean;
  onClose: () => void;
  translations: PickTranslations<
    | "Wishlist"
    | "Close"
    | "Your wishlist is empty"
    | "Quantity: $1"
    | "Remove from wishlist"
    | "Subtract item"
    | "Add item"
    | "Move to cart"
  >;
}) {
  let wishlistCount = useMemo(
    () => wishlist?.reduce((acc, item) => acc + item.quantity, 0),
    [wishlist]
  );

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10" onClose={onClose}>
        <div className="relative w-full min-h-screen">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay
              className="fixed inset-0"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed top-0 bottom-0 right-0 flex flex-col w-full max-w-md overflow-hidden text-left align-middle transition-all transform shadow-xl bg-zinc-900">
              <div className="flex justify-between p-4 lg:px-6">
                <button
                  data-testid="close-wishlist"
                  className="relative flex items-center hover:text-gray-300"
                  onClick={onClose}
                >
                  <CloseIcon className="w-6 h-6" />
                  <span className="ml-2">{translations.Close}</span>
                </button>
                <span className="relative flex items-center">
                  <WishlistIcon className="w-8 h-8" />
                  {!!wishlistCount && (
                    <span
                      style={{ lineHeight: "0.75rem" }}
                      className="absolute bottom-0 left-0 translate translate-y-[25%] translate-x-[-25%] inline-flex items-center justify-center px-[0.25rem] py-[0.125rem] text-xs text-zinc-900 bg-gray-50 rounded-full"
                    >
                      {wishlistCount}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex flex-col flex-1 overflow-y-auto">
                {!wishlist ? (
                  <div className="flex flex-col items-center justify-center h-full p-4 lg:px-6">
                    <span className="flex items-center justify-center w-24 h-24 border border-dashed rounded-full border-primary bg-secondary text-secondary">
                      <WishlistIcon className="block w-8 h-8" />
                    </span>
                    <Dialog.Title
                      as="h1"
                      className="pt-6 text-2xl font-bold tracking-wide text-center"
                    >
                      {translations["Your wishlist is empty"]}
                    </Dialog.Title>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 px-4 lg:px-6">
                      <Dialog.Title
                        as="h1"
                        className="mb-6 text-2xl font-semibold"
                      >
                        {translations.Wishlist}
                      </Dialog.Title>
                      <ul>
                        {wishlist.map((item) => (
                          <WishlistListItem
                            key={item.variantId}
                            formattedOptions={item.info.formattedOptions}
                            quantity={item.quantity}
                            formattedPrice={item.info.formattedPrice}
                            image={item.info.image}
                            title={item.info.title}
                            variantId={item.variantId}
                            productId={item.productId}
                            translations={translations}
                          />
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
