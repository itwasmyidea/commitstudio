"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  code: string;
  filename?: string;
  language?: string;
  className?: string;
}

export function CodeBlock({
  code,
  filename,
  language,
  className,
  ...props
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  
  // Detect if this is a terminal/bash code block
  const isTerminal = 
    language === 'bash' || 
    language === 'sh' || 
    language === 'shell' || 
    filename?.includes('terminal') || 
    (code && code.trim().startsWith('$')) || 
    (code && code.trim().startsWith('#!')) ||
    (filename && /terminal|console|bash|shell|command/i.test(filename));

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border">
      {filename && (
        <div className="flex items-center border-b bg-muted px-4 py-2 text-sm">
          {/* <span className="text-muted-foreground">{filename}</span> */}
          
          {isTerminal ? (
            <span className="text-xs bg-black/10 px-2 py-1 rounded-md text-muted-foreground">
              Terminal
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{language}</span>
          )}
        </div>
      )}
      
      <pre
        className={cn(
          "overflow-x-auto py-4 text-sm",
          isTerminal ? "bg-zinc-900" : "bg-black",
          !filename && "px-4 pt-4",
          isTerminal && "pl-6",
          "text-white",
          className
        )}
        {...props}
      >
        <code>{code}</code>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={copyToClipboard}
          aria-label="Copy code"
          className={cn(
            "absolute top-3 right-3 h-8 w-8 rounded-md opacity-0 transition-opacity duration-200",
            isTerminal ? "border border-border text-zinc-200 hover:bg-zinc-700" : "bg-gray-800/80 text-gray-200",
            "group-hover:opacity-100"
          )}
        >
          {isCopied ? (
            <CheckIcon className="h-4 w-4 text-green-500" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </pre>
    </div>
  );
} 