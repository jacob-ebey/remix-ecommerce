import Component from "~/containers/cdp/cdp.component";
import { loader } from "~/containers/cdp/cdp.server";
import { GenericCatchBoundary } from "~/containers/boundaries/generic-catch-boundary";
import { GenericErrorBoundary } from "~/containers/boundaries/generic-error-boundary";

export default Component;
export { loader };
export {
  GenericCatchBoundary as CatchBoundary,
  GenericErrorBoundary as ErrorBoundary,
};
