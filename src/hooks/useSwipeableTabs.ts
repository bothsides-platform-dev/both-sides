"use client";

import { useState, useCallback } from "react";
import type { PanInfo } from "framer-motion";
import type { Side } from "@prisma/client";

const SWIPE_THRESHOLD = 80; // pixels
const VELOCITY_THRESHOLD = 800; // pixels per second
const DIRECTION_RATIO = 1.5; // horizontal must exceed vertical by this factor

interface UseSwipeableTabsOptions {
  initialTab?: Side;
}

interface UseSwipeableTabsReturn {
  activeTab: Side;
  setActiveTab: (tab: Side) => void;
  handleDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
}

export function useSwipeableTabs(
  options: UseSwipeableTabsOptions = {}
): UseSwipeableTabsReturn {
  const { initialTab = "A" } = options;
  const [activeTab, setActiveTab] = useState<Side>(initialTab);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      // Only process horizontal gestures (ignore vertical scroll drift)
      const isHorizontalGesture =
        Math.abs(offset.y) < 10 ||
        Math.abs(offset.x) > Math.abs(offset.y) * DIRECTION_RATIO;

      if (!isHorizontalGesture) return;

      const swipedLeft = offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD;
      const swipedRight = offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD;

      if (swipedLeft && activeTab === "A") {
        setActiveTab("B");
      } else if (swipedRight && activeTab === "B") {
        setActiveTab("A");
      }
    },
    [activeTab]
  );

  return {
    activeTab,
    setActiveTab,
    handleDragEnd,
  };
}
