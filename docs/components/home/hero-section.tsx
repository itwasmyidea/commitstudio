import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { InstallCommand } from "@/components/home/install-command";
import { ArrowRight, Github } from "lucide-react";

export function HeroSection() {
  return (
    <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-16">
      <div className="container flex flex-col items-center gap-4 text-center">
        <Link
          href={siteConfig.links.npm}
          className="rounded-xl border border-border bg-border/50 text-primary/50 px-4 py-1 text-sm font-medium"
          target="_blank"
        >
          v0.3.5
        </Link>
        <h1 className="font-medium text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
          AI-powered Git Diff Analysis
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-lg sm:leading-6">
          CommitStudio uses AI to analyze your git diffs and provide insightful code reviews, 
          helping you catch bugs, improve code quality, and make better pull requests.
        </p>
      
        
        <InstallCommand />

        <div className="flex flex-row items-center gap-4">
          <Link
            href="/docs/1-getting-started/introduction"
            className={cn(
              buttonVariants({ size: "lg" })
            )}
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" })
            )}
          >
            <Github className="mr-2 h-4 w-4" />
            Visit GitHub
          </Link>
        </div>

      </div>
    </section>
  );
} 