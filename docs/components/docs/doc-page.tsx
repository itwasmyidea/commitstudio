"use client";

import { ChevronRight, Clock } from "lucide-react";
import { Metadata } from "@/lib/mdx";
import { cn, formatDate } from "@/lib/utils";
import { TableOfContents } from "@/components/docs/toc";
import { MdxClientWrapper } from "@/components/mdx/mdx-client-wrapper";
import { DocPagination } from "@/components/docs/doc-pagination";

interface DocPageProps {
  mdxContent: React.ReactNode;
  metadata: Metadata;
  slug: string;
  headings: { text: string; level: number; hash: string }[];
}

export function DocPage({ mdxContent, metadata, slug, headings }: DocPageProps) {
  // Function to process MDX content and remove the first h1 if it matches the title
  const processMdxContent = () => {
    // Return the MDX content in a wrapper
    return (
      <div className="mdx-processor max-w-full overflow-hidden">
        <MdxClientWrapper skipFirstHeading={true}>
          {mdxContent}
        </MdxClientWrapper>
      </div>
    );
  };
  
  return (
    <main className="relative py-4 w-full overflow-x-hidden lg:py-6">
      <div className="lg:pr-[220px] relative max-w-7xl mx-auto">
        <div className="w-full min-w-0 pr-2 md:pr-4">
        <div className="mb-3 flex items-center space-x-1 text-sm text-muted-foreground">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
            Docs
          </div>
          <ChevronRight className="h-4 w-4" />
          <div className="font-medium text-foreground">{metadata.title}</div>
        </div>
        <div className="space-y-2">
          <h1 className={cn("scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl")}>
            {metadata.title}
          </h1>
          {metadata.description && (
            <p className="text-md text-muted-foreground">{metadata.description}</p>
          )}
          {metadata.date && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <time dateTime={metadata.date}>{formatDate(metadata.date)}</time>
            </div>
          )}
        </div>
          <div className="pb-8 pt-6 overflow-x-auto">
          {processMdxContent()}
        </div>
        
        {/* Pagination with prominent styling */}
        <div className="mt-12 mb-8">
          <DocPagination slug={slug} />
        </div>
      </div>
        
      {metadata.toc !== false && headings.length > 0 && (
          <aside className="hidden lg:block">
            <div className="fixed right-4 xl:right-8 top-[4.5rem] pb-10 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <TableOfContents headings={headings} />
          </div>
          </aside>
        )}
        </div>
    </main>
  );
} 