"use client";

import { useState, useCallback } from "react";
import type { PanInfo } from "framer-motion";
import type { Side } from "@prisma/client";

const SWIPE_THRESHOLD = 50; // pixels
const VELOCITY_THRESHOLD = 500; // pixels per second

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

      // Check if swipe meets threshold or velocity requirements
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
