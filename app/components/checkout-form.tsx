import { Form } from "remix";
import cn from "classnames";

import type { CartInfo } from "~/models/ecommerce-provider.server";
import { PickTranslations } from "~/translations.server";

export function CheckoutForm({
  className,
  cart,
  translations,
}: {
  className: string;
  cart: CartInfo;
  translations: PickTranslations<
    "Subtotal" | "Taxes" | "Shipping" | "Total" | "Proceed to checkout"
  >;
}) {
  return (
    <Form method="post" action="/actions/checkout" className={className}>
      <table className="table-auto w-full">
        <tbody>
          <tr>
            <th className="text-left font-normal">{translations.Subtotal}</th>
            <td className="text-right">{cart.formattedSubTotal}</td>
          </tr>
          <tr>
            <th className="text-left font-normal">{translations.Taxes}</th>
            <td className="text-right">{cart.formattedTaxes}</td>
          </tr>
          <tr>
            <th className="text-left font-normal">{translations.Shipping}</th>
            <td className="text-right">{cart.formattedShipping}</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-3 pt-3 border-t border-zinc-700">
        <table className="table-auto w-full">
          <tbody>
            <tr>
              <th className="text-left font-semibold">{translations.Total}</th>
              <td className="text-right font-semibold">
                {cart.formattedTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button
        className={cn(
          "mt-6 py-4 bg-gray-50 text-gray-900 block w-full text-center font-semibold uppercase"
        )}
      >
        {translations["Proceed to checkout"]}
      </button>
    </Form>
  );
}
