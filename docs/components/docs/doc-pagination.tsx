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
    <nav aria-label="Pagination Navigation" className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center space-y-4 sm:space-y-0 mt-12 pt-8 border-t">
      {prevPage ? (
        <Link
          href={prevPage.slug}
          className="group flex-1 sm:flex-initial relative inline-flex items-center border border-border px-4 py-3 sm:py-4 text-sm font-medium rounded-lg transition-colors duration-200 ease-in-out hover:bg-primary hover:text-primary-foreground hover:border-primary"
          title={`Previous: ${prevPage.title}`}
        >
          <ChevronLeft className="h-4 w-4 mr-2 flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <div className="flex flex-col items-start">
            <span className="text-xs text-muted-foreground font-normal uppercase tracking-wide">Previous</span>
            <span className="font-medium">{prevPage.title}</span>
          </div>
        </Link>
      ) : (
        <div className="flex-1 sm:flex-initial" /> // Empty div to maintain spacing
      )}
      
      {nextPage ? (
        <Link
          href={nextPage.slug}
          className="group flex-1 sm:flex-initial relative inline-flex items-center border border-border px-4 py-3 sm:py-4 text-sm font-medium rounded-lg text-right transition-colors duration-200 ease-in-out hover:bg-primary hover:text-primary-foreground hover:border-primary"
          title={`Next: ${nextPage.title}`}
        >
          <div className="flex flex-col items-end ml-auto">
            <span className="text-xs text-muted-foreground font-normal uppercase tracking-wide">Next</span>
            <span className="font-medium">{nextPage.title}</span>
          </div>
          <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <div className="flex-1 sm:flex-initial" /> // Empty div to maintain spacing
      )}
    </nav>
  );
} 