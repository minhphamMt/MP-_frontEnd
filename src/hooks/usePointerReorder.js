import { useEffect, useRef, useState } from "react";

const RESET_DELAY_MS = 180;

const resolveDropIndex = (fromIndex, hoverIndex, position, length) => {
  if (
    fromIndex < 0 ||
    hoverIndex < 0 ||
    fromIndex >= length ||
    hoverIndex >= length
  ) {
    return null;
  }

  if (fromIndex === hoverIndex) return fromIndex;

  if (position === "before") {
    return fromIndex < hoverIndex ? hoverIndex - 1 : hoverIndex;
  }

  return fromIndex < hoverIndex ? hoverIndex : Math.min(length - 1, hoverIndex + 1);
};

export default function usePointerReorder({ itemCount = 0, onReorder }) {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const activePointerIdRef = useRef(null);
  const dragSuppressClickRef = useRef(false);
  const dragResetTimerRef = useRef(null);
  const dropTargetRef = useRef(null);
  const reorderHandlerRef = useRef(onReorder);
  const itemCountRef = useRef(itemCount);

  useEffect(() => {
    dropTargetRef.current = dropTarget;
  }, [dropTarget]);

  useEffect(() => {
    reorderHandlerRef.current = onReorder;
  }, [onReorder]);

  useEffect(() => {
    itemCountRef.current = itemCount;
  }, [itemCount]);

  useEffect(() => {
    return () => {
      if (dragResetTimerRef.current) {
        clearTimeout(dragResetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (draggingIndex === null || typeof document === "undefined") return undefined;

    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";

    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
    };
  }, [draggingIndex]);

  const markDragComplete = () => {
    dragSuppressClickRef.current = true;
    if (dragResetTimerRef.current) {
      clearTimeout(dragResetTimerRef.current);
    }
    dragResetTimerRef.current = setTimeout(() => {
      dragSuppressClickRef.current = false;
    }, RESET_DELAY_MS);
  };

  const resetDragState = () => {
    activePointerIdRef.current = null;
    dropTargetRef.current = null;
    setDraggingIndex(null);
    setDropTarget(null);
  };

  const commitDrop = () => {
    if (
      draggingIndex === null ||
      !dropTargetRef.current ||
      typeof reorderHandlerRef.current !== "function"
    ) {
      resetDragState();
      return;
    }

    const nextIndex = resolveDropIndex(
      draggingIndex,
      dropTargetRef.current.index,
      dropTargetRef.current.position,
      itemCountRef.current
    );

    if (nextIndex !== null && nextIndex !== draggingIndex) {
      reorderHandlerRef.current(draggingIndex, nextIndex);
      markDragComplete();
    }

    resetDragState();
  };

  useEffect(() => {
    if (draggingIndex === null || typeof window === "undefined") return undefined;

    const handlePointerMove = (event) => {
      if (activePointerIdRef.current !== event.pointerId) return;

      const row = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest?.("[data-reorder-item='true']");

      if (!row) return;

      const hoverIndex = Number(row.getAttribute("data-reorder-index"));
      if (!Number.isFinite(hoverIndex)) return;

      const bounds = row.getBoundingClientRect();
      const position =
        event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";

      setDropTarget((prev) =>
        prev?.index === hoverIndex && prev?.position === position
          ? prev
          : { index: hoverIndex, position }
      );
    };

    const handlePointerUp = (event) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      commitDrop();
    };

    const handlePointerCancel = (event) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      resetDragState();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [draggingIndex]);

  const startDrag = (event, index) => {
    if (itemCount < 2) return;

    event.preventDefault();
    event.stopPropagation();

    activePointerIdRef.current = event.pointerId;
    setDraggingIndex(index);
    setDropTarget({ index, position: "after" });
  };

  return {
    draggingIndex,
    dropTarget,
    startDrag,
    shouldSuppressClick: () => dragSuppressClickRef.current || draggingIndex !== null,
  };
}
