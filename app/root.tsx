import Component, {
  ErrorBoundary,
  CatchBoundary,
  links,
  meta,
  unstable_shouldReload,
} from "~/containers/layout/layout.component";
import { loader } from "~/containers/layout/layout.server";

export default Component;
export {
  ErrorBoundary,
  CatchBoundary,
  loader,
  links,
  meta,
  unstable_shouldReload,
};
