"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapseButtonProps {
  className?: string;
  defaultOpen?: boolean;
  title: string;
  children: React.ReactNode;
}

export function CollapseButton({ 
  className, 
  defaultOpen = true,
  title, 
  children 
}: CollapseButtonProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("space-y-1 ", className)}>
      <button
        type="button"
        className="flex w-full items-center justify-between py-1 text-sm font-semibold tracking-tighter text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <ChevronRight 
          className={cn(
            "h-4 w-4 transition-transform duration-200 ml-2", 
            isOpen ? "rotate-90" : ""
          )} 
        />
      </button>
      <div className={cn(
        "grid transition-all duration-200 ease-in-out",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
} 