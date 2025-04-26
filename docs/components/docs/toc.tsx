"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { cn, slugify } from "@/lib/utils";
import { Table2 } from "lucide-react";

interface TocProps {
  headings: {
    text: string;
    level: number;
    hash: string;
  }[];
}

export function TableOfContents({ headings }: TocProps) {
  const items = useMemo(() => {
    return headings.map((heading) => ({
      text: heading.text,
      level: heading.level,
      hash: slugify(heading.text),
    }));
  }, [headings]);

  const [activeId, setActiveId] = useState<string>("");
  const tocRef = useRef<HTMLDivElement>(null);
  const isScrollingToActive = useRef(false);
  
  // Ensure active item is always visible in TOC
  useEffect(() => {
    if (!tocRef.current || !activeId) return;
    
    // Prevent scroll cycles
    if (isScrollingToActive.current) return;
    isScrollingToActive.current = true;
    
    // Find the active element in the TOC
    const activeElement = tocRef.current.querySelector(`[href="#${activeId}"]`) as HTMLElement;
    if (!activeElement) {
      isScrollingToActive.current = false;
      return;
    }
    
    // Get positions
    const containerRect = tocRef.current.getBoundingClientRect();
    const activeRect = activeElement.getBoundingClientRect();
    
    // Check if the active element is not fully visible in the TOC viewport
    if (
      activeRect.top < containerRect.top || 
      activeRect.bottom > containerRect.bottom
    ) {
      // Calculate scroll position to center the active item
      const scrollTop = activeElement.offsetTop - (containerRect.height / 2) + (activeRect.height / 2);
      
      // Smooth scroll to the active item
      tocRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
    
    // Reset the flag after animation completes
    setTimeout(() => {
      isScrollingToActive.current = false;
    }, 300);
  }, [activeId]);
  
  // Observe headings to update active state
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find all entries that are intersecting
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          // Sort by position to get the topmost visible heading
          const sortedEntries = visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          
          // Set the topmost visible heading as active
          setActiveId(sortedEntries[0].target.id);
        }
      },
      { 
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0.1 
      }
    );

    // Observe all section headings
    items.forEach(item => {
      const element = document.getElementById(item.hash);
      if (element) observer.observe(element);
    });

    return () => {
      items.forEach(item => {
        const element = document.getElementById(item.hash);
        if (element) observer.unobserve(element);
      });
    };
  }, [items]);

  if (!items.length) {
    return null;
  }

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    const element = document.getElementById(hash);
    if (element) {
      // Add a slight offset to account for the sticky header
      const yOffset = -90; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ top: y, behavior: 'smooth' });
      window.history.pushState(null, '', `#${hash}`);
      setActiveId(hash);
    }
  };

  return (
    <div className="space-y-1 text-xs lg:text-xs py-4 w-[180px] xl:w-[200px] pl-4 border-l">
      <p className="font-medium mb-3 text-xs border-b border-border pb-4 flex items-center gap-2">
        <Table2 className="w-4 h-4" />
        Table of Contents
      </p>
      <div 
        ref={tocRef}
        className="overflow-y-auto pr-1 pb-12 pt-2 max-h-[calc(100vh-200px)]
                   [mask-image:linear-gradient(to_bottom,transparent,black_30px,black_calc(100%-60px),transparent)]
                   [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex flex-col">
          {items.map((item, index) => (
            <a
              key={index}
              href={`#${item.hash}`}
              onClick={(e) => handleAnchorClick(e, item.hash)}
              className={cn(
                "hover:underline transition-colors px-1 mb-1",
                "block py-1",
                item.level === 2 
                  ? "font-medium leading-5" 
                  : "pl-2 lg:pl-3 text-[11px] leading-4 opacity-60",
                activeId === item.hash 
                  ? "text-blu blu font-medium" 
                  : "text-muted-foreground"
              )}
            >
              <span className="inline-block">{item.text}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
} 