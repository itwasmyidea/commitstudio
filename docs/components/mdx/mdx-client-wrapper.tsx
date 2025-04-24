"use client";

import React from "react";

interface MdxClientWrapperProps {
  children: React.ReactNode;
  skipFirstHeading?: boolean;
}

// This component simply wraps MDX content in a client context
export function MdxClientWrapper({ children, skipFirstHeading = false }: MdxClientWrapperProps) {
  // Simple approach - just return children in a wrapper
  // The actual heading removal will happen in CSS to avoid complex React manipulation
  return (
    <div className={`mdx-client-wrapper ${skipFirstHeading ? 'skip-first-heading' : ''}`}>
      {children}
    </div>
  );
} 