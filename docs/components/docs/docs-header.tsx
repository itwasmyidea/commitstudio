"use client";

import Link from "next/link";
import { Menu, Github } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function DocsHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center">
          <div className="mr-3 flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" title="Navigation" className="p-0 pt-10">
                <DocsSidebar inSheetView={true} />
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center gap-1 sm:gap-2">
              <Logo className="text-primary -mb-0.5" size={22} />
              <span className="font-bold text-lg hidden md:inline">CommitStudio</span>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <ThemeToggle />
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
          >
            <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 sm:px-4 py-2">
              <Github className="mr-1.5 h-4 w-4" />
              GitHub
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
} 