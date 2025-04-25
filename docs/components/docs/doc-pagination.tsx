"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Define documentation structure for navigation
const docsStructure = [
  // Getting Started
  { slug: "/docs/1-getting-started/introduction", title: "Introduction" },
  { slug: "/docs/1-getting-started/installation", title: "Installation" },
  { slug: "/docs/1-getting-started/quick-start", title: "Quick Start" },
  
  // Usage
  { slug: "/docs/2-usage/standard-mode", title: "Standard Mode" },
  { slug: "/docs/2-usage/configuration-mode", title: "Configuration Mode" },
  { slug: "/docs/2-usage/yolo-mode", title: "YOLO Mode" },
  { slug: "/docs/2-usage/examples", title: "Examples" },
  
  // Configuration
  { slug: "/docs/3-configuration/options", title: "Configuration Options" },
  { slug: "/docs/3-configuration/customizing-behavior", title: "Customizing Behavior" },
  { slug: "/docs/3-configuration/environment-variables", title: "Environment Variables" },
  
  // Advanced
  { slug: "/docs/4-advanced/ci-cd-integration", title: "CI/CD Integration" },
  { slug: "/docs/4-advanced/custom-ai-models", title: "Custom AI Models" },
  { slug: "/docs/4-advanced/github-actions", title: "GitHub Actions" },
  
  // API Reference
  { slug: "/docs/5-api-reference/cli", title: "CLI Reference" },
  { slug: "/docs/5-api-reference/javascript-api", title: "JavaScript API" },
  { slug: "/docs/5-api-reference/output-format", title: "Output Format" },
  
  // Troubleshooting
  { slug: "/docs/6-troubleshooting/common-issues", title: "Common Issues" },
  { slug: "/docs/6-troubleshooting/faq", title: "FAQ" },
];

// Reusable navigation card component
interface NavCardProps {
  title: string;
  slug: string;
  direction: "prev" | "next";
}

function NavCard({ title, slug, direction }: NavCardProps) {
  const isPrev = direction === "prev";

  return (
    <Link
      href={slug}
      className="group flex-1 relative overflow-hidden rounded-lg   transition-all hover:border-primary/50"
      title={`${isPrev ? "Previous" : "Next"}: ${title}`}
    >
      <div className="flex flex-col justify-between p-6">
        <div className="space-y-0.5">
          <div className={`flex opacity-50 items-center text-xs text-gray-600 ${!isPrev && "justify-end"} transition-opacity group-hover:opacity-100`}>
            <span>{isPrev ? "Previous" : "Next"}</span>
          </div>
          <h3 className={`font-medium text-md relative ${!isPrev && "text-right"} transition-all group-hover:translate-x-2`}>
            {isPrev && <ChevronLeft className="inline h-3 w-3 absolute -left-4 top-1.5 transition-transform group-hover:-translate-x-1" />}
            {title}
            {!isPrev && <ChevronRight className="inline h-3 w-3 absolute -right-4 top-1.5 transition-transform group-hover:translate-x-1" />}
          </h3>
        </div>
       
      </div>
    </Link>
  );
}

interface DocPaginationProps {
  slug: string;
}

export function DocPagination({ slug }: DocPaginationProps) {
  // Add leading slash if missing
  const fullSlug = slug.startsWith('/') ? slug : `/${slug}`;
  
  // Find current page index in the document structure
  let currentIndex = docsStructure.findIndex(doc => doc.slug === fullSlug);
  
  // If not found with exact match, try simple path comparison
  if (currentIndex === -1) {
    currentIndex = docsStructure.findIndex(doc => 
      doc.slug.endsWith(fullSlug.split('/').pop() || '')
    );
  }
  
  // Get previous and next pages
  const prevPage = currentIndex > 0 ? docsStructure[currentIndex - 1] : null;
  const nextPage = currentIndex < docsStructure.length - 1 ? docsStructure[currentIndex + 1] : null;
  
  // If neither prev nor next is available, don't render pagination
  if (!prevPage && !nextPage) return null;
  
  return (
    <nav aria-label="Pagination Navigation" className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-12 pt-8 border-t">
      {prevPage ? (
        <NavCard title={prevPage.title} slug={prevPage.slug} direction="prev" />
      ) : (
        <div className="flex-1 sm:flex-initial" /> // Empty div to maintain spacing
      )}
      
      {nextPage ? (
        <NavCard title={nextPage.title} slug={nextPage.slug} direction="next" />
      ) : (
        <div className="flex-1 sm:flex-initial" /> // Empty div to maintain spacing
      )}
    </nav>
  );
} 