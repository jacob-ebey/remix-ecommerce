import Component, {
  meta,
} from "~/containers/generic-page/generic-page.component";
import { loader } from "~/containers/generic-page/generic-page.server";
import { GenericCatchBoundary } from "~/containers/boundaries/generic-catch-boundary";
import { GenericErrorBoundary } from "~/containers/boundaries/generic-error-boundary";

export default Component;
export { loader, meta };
export {
  GenericCatchBoundary as CatchBoundary,
  GenericErrorBoundary as ErrorBoundary,
};
