import { Metadata } from "next";

import { ScrollArea } from "@/components/ui/scroll-area";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsHeader } from "@/components/docs/docs-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "Documentation",
    template: `%s - CommitStudio Docs`,
  },
  description: "Documentation for the CommitStudio AI-powered git diff analysis tool.",
};

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <DocsHeader />
      <div className="container flex-1 max-w-full md:px-2 lg:px-4 xl:container">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-[180px_1fr] lg:grid-cols-[240px_1fr]">
          <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] md:sticky md:block">
            <ScrollArea className="h-full">
              <DocsSidebar alwaysExpandOnDesktop={true} />
            </ScrollArea>
          </aside>
          <main className="pl-6 py-6 overflow-x-hidden">
            <div className="mx-auto w-full min-w-0">
              {children}
            </div>
          </main>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
} 