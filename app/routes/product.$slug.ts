import Component, {
  meta,
  unstable_shouldReload,
} from "~/containers/pdp/pdp.component";
import { action, headers, loader } from "~/containers/pdp/pdp.server";
import { GenericCatchBoundary } from "~/containers/boundaries/generic-catch-boundary";
import { GenericErrorBoundary } from "~/containers/boundaries/generic-error-boundary";

export default Component;
export { action, headers, loader, meta, unstable_shouldReload };
export {
  GenericCatchBoundary as CatchBoundary,
  GenericErrorBoundary as ErrorBoundary,
};
