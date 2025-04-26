"use client";

import { useState } from "react";
import { ClipboardCopy, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function InstallCommand() {
  const [activeTab, setActiveTab] = useState("npm");
  const [copied, setCopied] = useState<string | null>(null);
  
  const commands = {
    npm: "npm install -g commitstudio",
    pnpm: "pnpm add -g commitstudio",
    yarn: "yarn global add commitstudio",
    bun: "bun install -g commitstudio"
  };
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };
  
  return (
    <div className="w-full max-w-md mx-auto my-4 px-4">
      {/* <div className="text-center mb-3">
        <span className="inline-flex items-center text-sm text-muted-foreground gap-1.5 bg-muted px-3 py-1 rounded-full">
          <Terminal className="h-3.5 w-3.5" />
          <span>Install with your favorite package manager</span>
        </span>
      </div> */}
      
      <Tabs 
        defaultValue="npm" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex flex-col items-center space-y-2">
          <TabsList className="bg-background/80 border w-full max-w-md grid grid-cols-4 p-0.5">
            <TabsTrigger value="npm">npm</TabsTrigger>
            <TabsTrigger value="pnpm">pnpm</TabsTrigger>
            <TabsTrigger value="yarn">yarn</TabsTrigger>
            <TabsTrigger value="bun">bun</TabsTrigger>
          </TabsList>
          
          <div className="relative w-full bg-muted/30 border shadow-sm rounded-sm overflow-hidden transition-all">
            {Object.entries(commands).map(([type, command]) => (
              <TabsContent 
                key={type} 
                value={type}
                className={cn(
                  "relative overflow-x-auto font-mono text-sm p-0 m-0",
                  activeTab === type ? "block" : "hidden"
                )}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <code className="text-primary">{command}</code>
                  <button
                    onClick={() => copyToClipboard(command, type)}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-sm hover:bg-accent/50 transition-colors"
                    aria-label="Copy to clipboard"
                  >
                    {copied === type ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <ClipboardCopy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
} 