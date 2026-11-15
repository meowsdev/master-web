'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const DRAG_THRESHOLD_PX = 4;

/**
 * Makes a horizontally overflowing row (e.g. the category chips) easy to move
 * with a mouse, not just a touchpad:
 *  - the mouse wheel scrolls it sideways,
 *  - it can be dragged (mouse),
 *  - `canScrollLeft/Right` + `scrollByAmount` drive the arrow buttons.
 * After a drag, `wasDragged()` lets a chip ignore the click that ends the drag.
 */
export function useHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const dragRef = useRef({ isDown: false, startX: 0, startScrollLeft: 0, moved: false });

  const updateArrows = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 4);
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Vertical wheel movement scrolls the row sideways (a mouse wheel has no horizontal axis).
    const handleWheel = (event: WheelEvent) => {
      const overflows = element.scrollWidth > element.clientWidth;
      if (!overflows || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      element.scrollBy({ left: event.deltaY, behavior: 'auto' });
    };

    // The observer reports the first size right after observe(), which also sets the arrows.
    const observer = new ResizeObserver(updateArrows);
    observer.observe(element);
    for (const child of Array.from(element.children)) observer.observe(child);

    // Chips arrive after the row exists (categories load from the API). The row's own box
    // doesn't change when that happens, so watch for added/removed chips as well.
    const childObserver = new MutationObserver(() => {
      for (const child of Array.from(element.children)) observer.observe(child);
      updateArrows();
    });
    childObserver.observe(element, { childList: true });

    // Drag to scroll. Listeners on `window` for move/up so a drag keeps working outside the row.
    const handleMouseDown = (event: MouseEvent) => {
      dragRef.current = { isDown: true, startX: event.pageX, startScrollLeft: element.scrollLeft, moved: false };
    };
    const handleMouseMove = (event: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag.isDown) return;
      const distance = event.pageX - drag.startX;
      if (Math.abs(distance) > DRAG_THRESHOLD_PX) drag.moved = true;
      if (drag.moved) element.scrollLeft = drag.startScrollLeft - distance;
    };
    const handleMouseUp = () => {
      dragRef.current.isDown = false;
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('scroll', updateArrows, { passive: true });
    element.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      observer.disconnect();
      childObserver.disconnect();
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('scroll', updateArrows);
      element.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [updateArrows]);

  const scrollByAmount = useCallback((amount: number) => {
    ref.current?.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  /** True right after a drag: the click that ends it must not select a chip. */
  const wasDragged = useCallback(() => dragRef.current.moved, []);

  return { ref, canScrollLeft, canScrollRight, scrollByAmount, wasDragged };
}
