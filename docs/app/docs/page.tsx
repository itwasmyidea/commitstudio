import Link from "next/link";
import { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Documentation for the CommitStudio AI-powered git diff analysis tool.",
};

export default function DocsPage() {
  return (
    <div className="relative w-full py-6">
      <div className="flex flex-col items-start gap-3 md:flex-row md:justify-between md:gap-6">
        <div className="flex-1 space-y-3">
          <h1 className="inline-block font-heading text-3xl lg:text-4xl">
            Documentation
          </h1>
          <p className="text-lg text-muted-foreground">
            Learn how to use CommitStudio to improve your code reviews with AI.
          </p>
        </div>
      </div>
      <div className="mx-auto grid grid-cols-1 gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="group relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-md">
          <div className="flex h-full flex-col justify-between gap-3">
            <div className="space-y-2">
              <h3 className="font-bold">Getting Started</h3>
              <p className="text-sm text-muted-foreground">
                Learn how to install and start using CommitStudio in your projects.
              </p>
            </div>
            <Link
              href="/docs/1-getting-started/introduction"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start px-0"
              )}
            >
              <span>Get Started</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-md">
          <div className="flex h-full flex-col justify-between gap-3">
            <div className="space-y-2">
              <h3 className="font-bold">Usage</h3>
              <p className="text-sm text-muted-foreground">
                Explore different modes and learn how to use CommitStudio effectively.
              </p>
            </div>
            <Link
              href="/docs/2-usage/standard-mode"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start px-0"
              )}
            >
              <span>Learn Usage</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-md">
          <div className="flex h-full flex-col justify-between gap-3">
            <div className="space-y-2">
              <h3 className="font-bold">Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Customize CommitStudio to fit your team&apos;s workflow and needs.
              </p>
            </div>
            <Link
              href="/docs/3-configuration/options"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start px-0"
              )}
            >
              <span>Configuration Options</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-md">
          <div className="flex h-full flex-col justify-between gap-3">
            <div className="space-y-2">
              <h3 className="font-bold">Advanced Usage</h3>
              <p className="text-sm text-muted-foreground">
                Integrate CommitStudio with CI/CD pipelines and GitHub Actions.
              </p>
            </div>
            <Link
              href="/docs/4-advanced/ci-cd-integration"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start px-0"
              )}
            >
              <span>Advanced Features</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-md">
          <div className="flex h-full flex-col justify-between gap-3">
            <div className="space-y-2">
              <h3 className="font-bold">API Reference</h3>
              <p className="text-sm text-muted-foreground">
                Explore the CLI and JavaScript API for CommitStudio.
              </p>
            </div>
            <Link
              href="/docs/5-api-reference/cli"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start px-0"
              )}
            >
              <span>API Documentation</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-md">
          <div className="flex h-full flex-col justify-between gap-3">
            <div className="space-y-2">
              <h3 className="font-bold">Troubleshooting</h3>
              <p className="text-sm text-muted-foreground">
                Find solutions to common issues and frequently asked questions.
              </p>
            </div>
            <Link
              href="/docs/6-troubleshooting/common-issues"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start px-0"
              )}
            >
              <span>Troubleshoot</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 