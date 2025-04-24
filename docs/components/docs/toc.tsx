"use client";

import { useEffect, useMemo, useState } from "react";
import { cn, slugify } from "@/lib/utils";

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
      { rootMargin: '-100px 0px -70% 0px' }
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
      const yOffset = -80; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ top: y, behavior: 'smooth' });
      window.history.pushState(null, '', `#${hash}`);
      setActiveId(hash);
    }
  };

  return (
    <div className="space-y-1 text-sm">
      <p className="font-medium mb-2">On This Page</p>
      <div className="flex flex-col space-y-1">
        {items.map((item, index) => (
          <a
            key={index}
            href={`#${item.hash}`}
            onClick={(e) => handleAnchorClick(e, item.hash)}
            className={cn(
              "line-clamp-2 hover:underline transition-colors py-1",
              item.level === 2 
                ? "font-medium" 
                : "pl-3 text-xs",
              activeId === item.hash 
                ? "text-blue-500 font-medium" 
                : "text-muted-foreground"
            )}
          >
            {item.text}
          </a>
        ))}
      </div>
    </div>
  );
} 