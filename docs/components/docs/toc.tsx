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
  
  // Observe headings to update active state
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
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

  // Observe footer to adjust TOC position
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    const tocContainer = document.querySelector('.toc-container') as HTMLElement;
    if (!tocContainer) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Footer is visible, adjust TOC position
            const footerTop = entry.boundingClientRect.top;
            const windowHeight = window.innerHeight;
            const offset = windowHeight - footerTop;
            
            if (offset > 0) {
              tocContainer.style.maxHeight = `calc(100vh - 6rem - ${offset}px)`;
            }
          } else {
            // Footer not visible, reset TOC height
            tocContainer.style.maxHeight = 'calc(100vh - 6rem)';
          }
        });
      },
      { threshold: 0 }
    );
    
    observer.observe(footer);
    return () => observer.unobserve(footer);
  }, []);

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
    <div className="space-y-1 text-xs lg:text-xs py-4 w-[180px] xl:w-[200px] pl-4 border-l toc-container">
      <p className="font-medium mb-3 text-xs border-b border-border pb-4 flex items-center gap-2">
        <Table2 className="w-4 h-4" />
        Table of Contents
      </p>
      <div 
        ref={tocRef}
        className="flex flex-col overflow-y-auto pr-1 pb-12 pt-2 max-h-[calc(100vh-200px)]
                   [mask-image:linear-gradient(to_bottom,transparent,black_30px,black_calc(100%-60px),transparent)]"
      >
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
  );
} 