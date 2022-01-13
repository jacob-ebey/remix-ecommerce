import Component, {
  meta,
} from "~/route-containers/generic-page/generic-page.component";
import { loader } from "~/route-containers/generic-page/generic-page.server";
import { GenericCatchBoundary } from "~/route-containers/boundaries/generic-catch-boundary";
import { GenericErrorBoundary } from "~/route-containers/boundaries/generic-error-boundary";

export default Component;
export { loader, meta };
export {
  GenericCatchBoundary as CatchBoundary,
  GenericErrorBoundary as ErrorBoundary,
};