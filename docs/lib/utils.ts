import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || "https://commitstud.io"}${path}`;
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getTableOfContents(content: string) {
  const headingLines = content
    .split("\n")
    .filter((line) => line.match(/^##*\s/));

  const headings = headingLines.map((raw) => {
    const text = raw.replace(/^##*\s/, "");
    const level = raw.slice(0, raw.indexOf(" ")).length;
    const hash = slugify(text);

    return {
      text,
      level,
      hash,
    };
  });

  return headings;
}
