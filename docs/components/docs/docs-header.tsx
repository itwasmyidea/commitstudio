"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
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
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <div className="mr-4 flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <DocsSidebar />
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="text-primary -mb-0.5" size={24} />
              <span className="font-bold text-xl hidden md:inline">CommitStudio</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm ml-4">
              <Link
                href="/docs"
                className="transition-colors hover:text-foreground/80 text-foreground/60 "
              >
                Docs
              </Link>
              <Link
                href={siteConfig.links.github}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </Link>
            </nav>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
          >
            <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              GitHub
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
} 