import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Github, Globe } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="text-primary -mb-0.5" size={24} />
            <span className="font-bold text-xl">CommitStudio</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-3">
          <ThemeToggle />
          <Link
            href={siteConfig.links.github}
            rel="noreferrer"
            className={cn(
              buttonVariants({ size: "sm" })
            )}
          >
            <Github className="mr-1.5 h-4 w-4" />
            GitHub
          </Link>
          <Link
            href="https://commitstud.io"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "transition-colors hover:text-primary"
            )}
          >
            <Globe className="mr-1.5 h-4 w-4" />
            Website
          </Link>
        
        </nav>
      </div>
    </header>
  );
} 