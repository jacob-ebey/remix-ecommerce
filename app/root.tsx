import Component, {
  ErrorBoundary,
  CatchBoundary,
  links,
  meta,
} from "~/containers/layout/layout.component";
import { loader } from "~/containers/layout/layout.server";

export default Component;
export { ErrorBoundary, CatchBoundary, loader, links, meta };
