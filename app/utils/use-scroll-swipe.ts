import { useEffect } from "react";
import type { RefObject } from "react";

export type SwipeScrollOptions = {
  sliderRef: RefObject<HTMLElement>;
  reliants?: any[];
  onMove?: () => void;
};

export function useSwipeScroll({
  sliderRef,
  reliants = [],
  onMove,
}: SwipeScrollOptions) {
  useEffect(() => {
    let pos = { top: 0, left: 0, x: 0, y: 0 };

    const slider = sliderRef.current!;
    let isDown = false;
    let dragged = false;

    const onClick = (event: MouseEvent) => {
      if (dragged) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }

      dragged = false;
    };

    const onMouseDown = (event: MouseEvent) => {
      if (typeof (event as any)?.persist === "function") {
        (event as any)?.persist();
      }
      isDown = true;
      pos = {
        // The current scroll
        left: slider.scrollLeft,
        top: slider.scrollTop,
        // Get the current mouse position
        x: event.clientX,
        y: event.clientY,
      };
      slider.classList.add("active");
    };

    const onMouseLeave = () => {
      isDown = false;
      slider.classList.remove("active");
    };

    const onMouseUp = () => {
      isDown = false;
      slider.classList.remove("active");

      if (dragged) {
        return false;
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDown) return;
      event.preventDefault();

      // TODO: potentially add buffer zone for registering a drag if clicks are an issue
      dragged = true;

      // How far the mouse has been moved
      const dx = event.clientX - pos.x;
      const dy = event.clientY - pos.y;

      // Scroll the element
      slider.scrollTop = pos.top - dy;
      slider.scrollLeft = pos.left - dx;

      onMove?.();

      if (dragged) {
        return false;
      }
    };

    slider.addEventListener("click", onClick);
    slider.addEventListener("mousedown", onMouseDown);
    slider.addEventListener("mouseleave", onMouseLeave);
    slider.addEventListener("mouseup", onMouseUp);
    slider.addEventListener("mousemove", onMouseMove);

    return () => {
      slider.removeEventListener("click", onClick);
      slider.removeEventListener("mousedown", onMouseDown);
      slider.removeEventListener("mouseleave", onMouseLeave);
      slider.removeEventListener("mouseup", onMouseUp);
      slider.removeEventListener("mousemove", onMouseMove);
    };
  }, [...reliants]);
}
