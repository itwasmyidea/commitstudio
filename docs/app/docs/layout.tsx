import { Metadata } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsHeader } from "@/components/docs/docs-header";
import { siteConfig } from "@/config/site";

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
      <div className="container flex-1">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-[250px_1fr] lg:grid-cols-[280px_1fr]">
          <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] md:sticky md:block border-r">
            <ScrollArea className="h-full">
              <DocsSidebar />
            </ScrollArea>
          </aside>
          <main className="pl-6 py-6">
            <div className="mx-auto w-full min-w-0">
              {children}
            </div>
          </main>
        </div>
      </div>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center gap-4 md:h-14 md:flex-row md:justify-between">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Developed by{" "}
            <a
              href={siteConfig.links.devWebsite}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              SofTx Innovations Inc
            </a>
            . Open Source & Available on{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
} 