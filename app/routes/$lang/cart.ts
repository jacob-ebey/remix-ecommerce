import Component from "~/containers/cart/cart.component";
import { action, headers, loader } from "~/containers/cart/cart.server";
import { GenericCatchBoundary } from "~/containers/boundaries/generic-catch-boundary";
import { GenericErrorBoundary } from "~/containers/boundaries/generic-error-boundary";

export default Component;
export { action, headers, loader };
export {
  GenericCatchBoundary as CatchBoundary,
  GenericErrorBoundary as ErrorBoundary,
};
