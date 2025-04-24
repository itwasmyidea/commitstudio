"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CollapseButton } from "@/components/ui/collapse-button";

interface DocsSidebarProps {
  className?: string;
}

interface DocsSidebarNavProps {
  items: SidebarNavItem[];
}

interface SidebarNavItem {
  title: string;
  href?: string;
  items?: SidebarNavItem[];
  label?: string;
  disabled?: boolean;
}

export function DocsSidebar({ className }: DocsSidebarProps) {
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

  const pathname = usePathname();

  return (
    <div className={cn("pb-4 pt-6", className)}>
      <div className="space-y-6">
        <DocsSidebarNav items={items} />
      </div>
    </div>
  );
}

export function DocsSidebarNav({ items }: DocsSidebarNavProps) {
  const pathname = usePathname();

  return items.length ? (
    <div className="flex flex-col space-y-6 px-3 py-3">
      {items.map((item, index) => (
        <div key={index} className="space-y-3">
          <CollapseButton title={item.title}>
            {item.items?.length && (
              <div className="flex flex-col space-y-2 mt-1">
                {item.items.map((child, index) =>
                  child.href ? (
                    <Link
                      key={index}
                      href={child.href}
                      className={cn(
                        "text-sm flex items-center",
                        {
                          "font-medium text-blue-600 ml-4": pathname === child.href,
                          "text-muted-foreground hover:text-foreground ml-4": pathname !== child.href,
                        }
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
                      className="flex text-sm px-1 py-1 ml-4 text-muted-foreground/50 cursor-not-allowed"
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
              </div>
            )}
          </CollapseButton>
        </div>
      ))}
    </div>
  ) : null;
} 