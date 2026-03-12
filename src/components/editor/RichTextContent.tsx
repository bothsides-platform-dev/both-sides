"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

interface RichTextContentProps {
  html: string;
  className?: string;
}

export function RichTextContent({ html, className }: RichTextContentProps) {
  const sanitizedHtml = useMemo(() => {
    if (typeof window === "undefined") return html;
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "em", "h2", "h3",
        "ul", "ol", "li", "blockquote", "a", "hr",
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "class"],
    });
  }, [html]);

  return (
    <div
      className={`prose prose-sm dark:prose-invert max-w-none ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
