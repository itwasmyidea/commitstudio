import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="text-primary -mb-0.5" size={24} />
              <span className="font-bold text-xl">CommitStudio</span>
              <span className="text-xs text-muted-foreground ml-1 mt-1">v0.3.5</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-3">
            <ThemeToggle />
            <Link
              href="https://commitstud.io"
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "transition-colors hover:text-primary"
              )}
            >
              Website
            </Link>
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ size: "sm" })
              )}
            >
              GitHub
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex flex-col items-center gap-4 text-center">
            <Link
              href={siteConfig.links.github}
              className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
              target="_blank"
            >
              Follow along on GitHub
            </Link>
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              AI-powered Git Diff Analysis
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              CommitStudio uses AI to analyze your git diffs and provide insightful code reviews, 
              helping you catch bugs, improve code quality, and make better pull requests.
            </p>
            <div className="space-x-4">
              <Link
                href="/docs/1-getting-started/introduction"
                className={cn(
                  buttonVariants({ size: "lg" })
                )}
              >
                Get Started
              </Link>
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" })
                )}
              >
                GitHub
              </Link>
            </div>
          </div>
        </section>
        <section id="features" className="py-8 md:py-12 lg:py-24">
          <div className="container space-y-10">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
                Features
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                CommitStudio provides powerful features to enhance your code review process.
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Link href="/docs/1-getting-started/quick-start" className="relative overflow-hidden rounded-lg border bg-background p-2 transition-colors hover:bg-muted">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <div className="space-y-2">
                    <h3 className="font-bold">Quick Start</h3>
                    <p className="text-sm text-muted-foreground">
                      Get up and running with CommitStudio in minutes with this straightforward guide.
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground/60 flex items-center">
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </div>
                </div>
              </Link>
              <Link href="/docs/2-usage/standard-mode" className="relative overflow-hidden rounded-lg border bg-background p-2 transition-colors hover:bg-muted">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <div className="space-y-2">
                    <h3 className="font-bold">Standard Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn how to use CommitStudio's standard mode for thorough code reviews and analysis.
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground/60 flex items-center">
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </div>
                </div>
              </Link>
              <Link href="/docs/2-usage/yolo-mode" className="relative overflow-hidden rounded-lg border bg-background p-2 transition-colors hover:bg-muted">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <div className="space-y-2">
                    <h3 className="font-bold">YOLO Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover the faster, streamlined YOLO mode for quick feedback on your changes.
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground/60 flex items-center">
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </div>
                </div>
              </Link>
              <Link href="/docs/3-configuration/options" className="relative overflow-hidden rounded-lg border bg-background p-2 transition-colors hover:bg-muted">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <div className="space-y-2">
                    <h3 className="font-bold">Configuration Options</h3>
                    <p className="text-sm text-muted-foreground">
                      Customize CommitStudio with various configuration options to match your workflow.
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground/60 flex items-center">
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </div>
                </div>
              </Link>
              <Link href="/docs/6-troubleshooting/faq" className="relative overflow-hidden rounded-lg border bg-background p-2 transition-colors hover:bg-muted">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <div className="space-y-2">
                    <h3 className="font-bold">FAQ</h3>
                    <p className="text-sm text-muted-foreground">
                      Find answers to frequently asked questions about CommitStudio.
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground/60 flex items-center">
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </div>
                </div>
              </Link>
              <Link href="/docs/6-troubleshooting/common-issues" className="relative overflow-hidden rounded-lg border bg-background p-2 transition-colors hover:bg-muted">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <div className="space-y-2">
                    <h3 className="font-bold">Common Issues</h3>
                    <p className="text-sm text-muted-foreground">
                      Solutions to common problems and troubleshooting tips for CommitStudio.
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground/60 flex items-center">
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </div>
                </div>
              </Link>
            </div>
            <div className="mx-auto text-center">
              <Link
                href="/docs/1-getting-started/introduction"
                className={cn(
                  buttonVariants({
                    size: "lg",
                    className: "mt-4",
                  })
                )}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} CommitStudio. All rights reserved.
            </p>
          </div>
          <div className="flex items-center">
            <Link
              href="https://commitstud.io"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground mr-4"
            >
              Website
            </Link>
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
