'use client';

import { RefObject, useLayoutEffect, useState } from 'react';

interface FitScaleOptions {
  /** Natural width of the content when laid out in a row. */
  rowWidth: number;
  /** Natural width of the content when stacked in a column. */
  columnWidth: number;
  /** Below this scale a row would be too small to read, so stack instead. */
  minRowScale: number;
}

interface FitScale {
  scale: number;
  isRow: boolean;
  isMeasured: boolean;
}

/**
 * Picks the largest layout that fits the container: a row scaled down to
 * `minRowScale`, otherwise a stacked column scaled to the available width.
 * Content is never scaled above its design size (scale <= 1).
 */
export function useFitScale(
  containerRef: RefObject<HTMLElement | null>,
  { rowWidth, columnWidth, minRowScale }: FitScaleOptions,
): FitScale {
  const [fit, setFit] = useState<FitScale>({ scale: 1, isRow: true, isMeasured: false });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      // clientWidth includes padding, which the content must not use.
      const { paddingLeft, paddingRight } = getComputedStyle(container);
      const availableWidth =
        container.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight);
      const rowScale = availableWidth / rowWidth;
      const isRow = rowScale >= minRowScale;
      const scale = Math.min(1, isRow ? rowScale : availableWidth / columnWidth);
      setFit({ scale, isRow, isMeasured: true });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, rowWidth, columnWidth, minRowScale]);

  return fit;
}
