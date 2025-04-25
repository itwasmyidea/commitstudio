import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers";
import { siteConfig } from "@/config/site";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["Git", "Code Review", "AI", "CommitStudio", "Developer Tools"],
  authors: [
    {
      name: "CommitStudio Team",
      url: "https://commitstud.io",
    },
  ],
  creator: "CommitStudio",
  publisher: "CommitStudio",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://docs.commitstud.io",
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "/meta/og.png",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/meta/og.png"],
    creator: "@commitstudio",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/meta/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/meta/favicon.ico",
    apple: "/meta/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        url: "/meta/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        rel: "mask-icon",
        url: "/meta/safari-pinned-tab.svg",
        color: "#5bbad5",
      },
    ],
  },
  manifest: "/meta/site.webmanifest",
  metadataBase: new URL("https://docs.commitstud.io"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/meta/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/meta/favicon-96x96.png" />
        <link rel="manifest" href="/meta/site.webmanifest" />
        <link rel="mask-icon" href="/meta/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
