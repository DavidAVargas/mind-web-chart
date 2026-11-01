import { useEffect, type RefObject } from "react";
import { useReactFlow } from "@xyflow/react";

/**
 * Keeps whatever is in the middle of the chart in the middle when the chart
 * changes size, like when a foldable phone opens or closes or the window is
 * resized. Without it the chart stays pinned to its top-left corner and drifts
 * off to one side.
 */
export function useKeepCenter(ref: RefObject<HTMLElement | null>) {
  const { getViewport, setViewport } = useReactFlow();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let width = element.clientWidth;
    let height = element.clientHeight;

    const observer = new ResizeObserver(() => {
      const nextWidth = element.clientWidth;
      const nextHeight = element.clientHeight;
      if (!nextWidth || !nextHeight) return;
      // Hidden until now, so there's no earlier middle to keep.
      if (width && height) {
        const { x, y, zoom } = getViewport();
        setViewport({
          x: x + (nextWidth - width) / 2,
          y: y + (nextHeight - height) / 2,
          zoom,
        });
      }
      width = nextWidth;
      height = nextHeight;
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, getViewport, setViewport]);
}
