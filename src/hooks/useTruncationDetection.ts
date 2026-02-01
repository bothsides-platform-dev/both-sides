"use client";

import { useRef, useState, useEffect } from "react";

export function useTruncationDetection(
  contentKey: string,
  isExpanded: boolean
) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const wasTruncatedRef = useRef(false);

  useEffect(() => {
    wasTruncatedRef.current = false;
    setIsTruncated(false);
  }, [contentKey]);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const checkTruncation = () => {
      if (isExpanded) return;
      const truncated = element.scrollHeight > element.clientHeight;
      setIsTruncated(truncated);
      if (truncated) wasTruncatedRef.current = true;
    };

    checkTruncation();
    const resizeObserver = new ResizeObserver(checkTruncation);
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [isExpanded, contentKey]);

  const showButton = isTruncated || (isExpanded && wasTruncatedRef.current);
  return { textRef, showButton };
}
