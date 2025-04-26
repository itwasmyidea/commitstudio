"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CollapseButton } from "@/components/ui/collapse-button";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

interface DocsSidebarProps {
  className?: string;
  inSheetView?: boolean;
  alwaysExpandOnDesktop?: boolean;
}

interface DocsSidebarNavProps {
  items: SidebarNavItem[];
  inSheetView?: boolean;
  alwaysExpandOnDesktop?: boolean;
}

interface SidebarNavItem {
  title: string;
  href?: string;
  items?: SidebarNavItem[];
  label?: string;
  disabled?: boolean;
}

export function DocsSidebar({ className, inSheetView, alwaysExpandOnDesktop = false }: DocsSidebarProps) {
  const items: SidebarNavItem[] = [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs/1-getting-started/introduction",
        },
        {
          title: "Installation",
          href: "/docs/1-getting-started/installation",
        },
        {
          title: "Quick Start",
          href: "/docs/1-getting-started/quick-start",
        },
      ],  
    },
    {
      title: "Usage",
      items: [
        {
          title: "Standard Mode",
          href: "/docs/2-usage/standard-mode",
        },
        {
          title: "Configuration Mode",
          href: "/docs/2-usage/configuration-mode",
        },
        {
          title: "YOLO Mode",
          href: "/docs/2-usage/yolo-mode",
        },
        {
          title: "Examples",
          href: "/docs/2-usage/examples",
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        {
          title: "Configuration Options",
          href: "/docs/3-configuration/options",
        },
        {
          title: "Customizing Behavior",
          href: "/docs/3-configuration/customizing-behavior",
        },
        {
          title: "Environment Variables",
          href: "/docs/3-configuration/environment-variables",
        },
      ],
    },
    {
      title: "Advanced",
      items: [
        {
          title: "Integration with CI/CD",
          href: "/docs/4-advanced/ci-cd-integration",
        },
        {
          title: "Custom AI Models",
          href: "/docs/4-advanced/custom-ai-models",
        },
        {
          title: "GitHub Actions Integration",
          href: "/docs/4-advanced/github-actions",
        },
      ],
    },
    {
      title: "API Reference",
      items: [
        {
          title: "CommitStudio CLI",
          href: "/docs/5-api-reference/cli",
        },
        {
          title: "JavaScript API",
          href: "/docs/5-api-reference/javascript-api",
        },
        {
          title: "Output Format",
          href: "/docs/5-api-reference/output-format",
        },
      ],
    },
    {
      title: "Troubleshooting",
      items: [
        {
          title: "Common Issues",
          href: "/docs/6-troubleshooting/common-issues",
        },
        {
          title: "FAQ",
          href: "/docs/6-troubleshooting/faq",
        },
      ],
    },
  ];

  return (
    <div className={cn(
      "py-2 sm:py-4", 
      inSheetView && "h-[calc(100vh-4rem)] overflow-y-auto pb-20",
      className
    )}>
      <div className="space-y-2">
        <DocsSidebarNav 
          items={items} 
          inSheetView={inSheetView} 
          alwaysExpandOnDesktop={alwaysExpandOnDesktop} 
        />
      </div>
    </div>
  );
}

export function DocsSidebarNav({ items, inSheetView, alwaysExpandOnDesktop = false }: DocsSidebarNavProps) {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const forceExpand = alwaysExpandOnDesktop && isDesktop;

  return items.length ? (
    <div className={cn(
      "flex flex-col space-y-2 px-3 py-3 md:py-6",
      !inSheetView && "border-l border-r"
    )}>
      {items.map((item, index) => (
        <div key={index} className="space-y-1">
          <CollapseButton 
            title={item.title} 
            defaultOpen={pathname.includes(item.title.toLowerCase())}
            alwaysOpen={forceExpand}
          >
            {item.items?.length && (
              <motion.div 
                className="flex flex-col space-y-1 mt-1 border-l ml-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {item.items.map((child, index) =>
                  child.href ? (
                    <Link
                      key={index}
                      href={child.href}
                      className={cn(
                        "text-sm flex items-center py-1.5 px-3 rounded-md transition-colors",
                        inSheetView && "py-2",
                        pathname === child.href
                          ? "text-primary font-medium bg-primary/5 ml-2"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/40 ml-2",
                      )}
                      target={child.disabled ? "_blank" : ""}
                      rel={child.disabled ? "noreferrer" : ""}
                    >
                      {child.title}
                      {child.label && (
                        <Badge variant="outline" className="ml-2">
                          {child.label}
                        </Badge>
                      )}
                    </Link>
                  ) : (
                    <span
                      key={index}
                      className={cn(
                        "flex text-xs px-3 py-1.5 ml-2 text-muted-foreground/50 cursor-not-allowed",
                        inSheetView && "py-2"
                      )}
                    >
                      {child.title}
                      {child.label && (
                        <Badge variant="outline" className="ml-2">
                          {child.label}
                        </Badge>
                      )}
                    </span>
                  )
                )}
              </motion.div>
            )}
          </CollapseButton>
        </div>
      ))}
    </div>
  ) : null;
} 