"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps as NextThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: React.PropsWithChildren<Partial<NextThemeProviderProps>>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
} 