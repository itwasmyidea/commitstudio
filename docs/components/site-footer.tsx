import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Github, Twitter } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteFooter() {
  return (
    <footer className="border-t py-4 md:py-0">
      <div className="flex flex-col items-center gap-6 px-4 md:px-6 lg:px-8 md:h-14 md:flex-row md:justify-between md:gap-4">
        <p className="text-center text-xs leading-normal text-muted-foreground md:text-left whitespace-nowrap">
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
        <div className="flex items-center justify-center md:justify-end">
          <div className="flex items-center">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <div className="mx-1 h-4 w-px bg-border" />
            <Link 
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <div className="mx-1 h-4 w-px bg-border" />
            <div className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 