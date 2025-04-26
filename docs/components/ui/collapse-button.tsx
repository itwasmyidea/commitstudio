"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/store";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

interface CollapseButtonProps {
  className?: string;
  defaultOpen?: boolean;
  title: string;
  children: React.ReactNode;
  alwaysOpen?: boolean;
}

export function CollapseButton({ 
  className, 
  defaultOpen = true,
  title, 
  children,
  alwaysOpen = false
}: CollapseButtonProps) {
  const { expandedSections, toggleSection, setSectionState } = useSidebarStore();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  // Initialize state from store or default value
  const storeExpanded = expandedSections[title];
  const [isOpen, setIsOpen] = useState(storeExpanded !== undefined ? storeExpanded : defaultOpen);
  
  // Update local state when store changes
  useEffect(() => {
    if (storeExpanded !== undefined) {
      setIsOpen(storeExpanded);
    }
  }, [storeExpanded, title]);
  
  // Set default open state for desktop (md and above)
  useEffect(() => {
    if (isDesktop && storeExpanded === undefined) {
      setSectionState(title, true);
      setIsOpen(true);
    }
  }, [isDesktop, setSectionState, storeExpanded, title]);
  
  const handleToggle = () => {
    if (!alwaysOpen) {
      toggleSection(title);
      setIsOpen(!isOpen);
    }
  };

  // If alwaysOpen is true, force open state
  const displayOpen = alwaysOpen ? true : isOpen;

  return (
    <div className={cn("space-y-1", className)}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between py-1 text-sm font-semibold tracking-tighter transition-colors",
          displayOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        onClick={handleToggle}
        disabled={alwaysOpen}
      >
        <span>{title}</span>
        {!alwaysOpen && (
          <ChevronRight 
            className={cn(
              "h-4 w-4 transition-transform duration-200 ml-2", 
              displayOpen ? "rotate-90" : ""
            )} 
          />
        )}
      </button>
      <div className={cn(
        "grid transition-all duration-200 ease-in-out",
        displayOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
} 