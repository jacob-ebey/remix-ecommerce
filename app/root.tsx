import Component, {
  ErrorBoundary,
  CatchBoundary,
  links,
  meta,
  shouldRevalidate,
} from "~/route-containers/layout/layout.component";
import { loader } from "~/route-containers/layout/layout.server";

export default Component;
export { ErrorBoundary, CatchBoundary, loader, links, meta, shouldRevalidate };
