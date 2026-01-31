"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ReferenceLink {
  url: string;
  title?: string;
}

interface ReferenceLinksCollapsibleProps {
  links: ReferenceLink[];
}

export function ReferenceLinksCollapsible({
  links,
}: ReferenceLinksCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
        <span>참고링크 ({links.length}개)</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-2 data-[state=open]:slide-down-2">
        <div className="rounded-b-lg bg-muted/30 px-4 pb-4 pt-2 space-y-2">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span className="truncate">{link.title || link.url}</span>
            </a>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
