import type { ComponentPropsWithoutRef } from "react";

export function OptimizedImage({
  optimizerUrl = "/resources/image",
  responsive,
  src,
  ...rest
}: ComponentPropsWithoutRef<"img"> & {
  optimizerUrl?: string;
  responsive?: {
    maxWidth?: number;
    size: { width: number; height?: number };
  }[];
}) {
  let url = src ? optimizerUrl + "?src=" + encodeURIComponent(src) : src;

  let props: ComponentPropsWithoutRef<"img"> = {
    src: url + `&width=${rest.width || ""}&height=${rest.height || ""}`,
  };

  let largestImageWidth = 0;
  let largestImageSrc: string | undefined;
  if (responsive && responsive.length) {
    let srcSet = "";
    let sizes = "";
    for (let { maxWidth, size } of responsive) {
      if (srcSet) {
        srcSet += ", ";
      }
      let srcSetUrl =
        url + `&width=${size.width}&height=${size.height || ""} ${size.width}w`;
      srcSet += srcSetUrl;

      if (maxWidth) {
        if (sizes) {
          sizes += ", ";
        }
        sizes += `(max-width: ${maxWidth}px) ${size.width}px`;
      }

      if (size.width > largestImageWidth) {
        largestImageWidth = size.width;
        largestImageSrc = srcSetUrl;
      }
    }
    props.srcSet = srcSet;
    props.sizes = sizes || "100vw";
    props.src = "";
  }

  if (largestImageSrc && (!rest.width || largestImageWidth > rest.width)) {
    props.src = largestImageSrc;
  }

  return <img {...rest} {...props} />;
}
