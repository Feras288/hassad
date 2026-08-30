import { useRef, useState } from "react";

type SwipeAxis = "x" | "y";

interface UseSwipeToCloseOptions {
  enabled: boolean;
  axis: SwipeAxis;
  /** 1 = اتجاه موجب (يمين/أسفل)، -1 = اتجاه سالب (يسار/أعلى). */
  closeDirection: 1 | -1;
  onClose: () => void;
  threshold?: number;
}

/**
 * إيماءة خفيفة مخصّصة للمس فقط. لا تعترض تمرير الصفحة حتى يصبح السحب واضحاً
 * في اتجاه الإغلاق، وتعيد اللوحة لموضعها عند الإفلات قبل عتبة الإغلاق.
 */
export function useSwipeToClose({
  enabled,
  axis,
  closeDirection,
  onClose,
  threshold = 72,
}: UseSwipeToCloseOptions) {
  const startRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const [offset, setOffset] = useState(0);

  const clear = () => {
    startRef.current = null;
    setOffset(0);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!enabled || event.pointerType === "mouse") return;
    startRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const start = startRef.current;
    if (!enabled || !start || start.pointerId !== event.pointerId) return;
    const rawDelta = axis === "x" ? event.clientX - start.x : event.clientY - start.y;
    const directionalDelta = rawDelta * closeDirection;
    if (directionalDelta <= 0) return;
    if (directionalDelta > 8) event.preventDefault();
    setOffset(Math.min(directionalDelta, threshold * 1.45));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (startRef.current?.pointerId !== event.pointerId) return;
    const shouldClose = offset >= threshold;
    clear();
    if (shouldClose) onClose();
  };

  const onPointerCancel = () => clear();
  const transform = offset === 0 ? undefined : axis === "x"
    ? `translateX(${offset * closeDirection}px)`
    : `translateY(${offset * closeDirection}px)`;

  return {
    swipeStyle: transform ? { transform, transition: "none" } : undefined,
    swipeHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
