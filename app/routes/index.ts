import Component from "~/containers/home/home.component";
import { loader } from "~/containers/home/home.server";
import { GenericCatchBoundary } from "~/containers/boundaries/generic-catch-boundary";
import { GenericErrorBoundary } from "~/containers/boundaries/generic-error-boundary";

export default Component;
export { loader };
export {
  GenericCatchBoundary as CatchBoundary,
  GenericErrorBoundary as ErrorBoundary,
};