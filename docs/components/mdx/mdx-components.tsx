import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { cn, slugify } from "@/lib/utils";

import { Callout } from "@/components/mdx/callout";
import { CodeBlock } from "@/components/mdx/code-block";
import { ComponentExample } from "@/components/mdx/component-example";

// Helper to detect if a code block is a terminal command
function isTerminalCode(content: string, language?: string): boolean {
  if (language === 'bash' || language === 'sh' || language === 'shell') return true;
  if (content && (content.trim().startsWith('$') || content.trim().startsWith('#!'))) return true;
  return false;
}

const components = {
  h1: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = typeof children === 'string' ? slugify(children) : '';
    
    return (
      <h1
        id={id}
        className={cn(
          "mt-2 scroll-m-20 text-4xl font-bold tracking-tight",
          className
        )}
        {...props}
      >
        {children}
      </h1>
    );
  },
  h2: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = typeof children === 'string' ? slugify(children) : '';
    
    return (
      <h2
        id={id}
        className={cn(
          "mt-10 scroll-m-20 border-b pb-1 text-3xl font-semibold tracking-tight first:mt-0",
          className
        )}
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = typeof children === 'string' ? slugify(children) : '';
    
    return (
      <h3
        id={id}
        className={cn(
          "mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  },
  h4: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = typeof children === 'string' ? slugify(children) : '';
    
    return (
      <h4
        id={id}
        className={cn(
          "mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
          className
        )}
        {...props}
      >
        {children}
      </h4>
    );
  },
  h5: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = typeof children === 'string' ? slugify(children) : '';
    
    return (
      <h5
        id={id}
        className={cn(
          "mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
          className
        )}
        {...props}
      >
        {children}
      </h5>
    );
  },
  h6: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = typeof children === 'string' ? slugify(children) : '';
    
    return (
      <h6
        id={id}
        className={cn(
          "mt-8 scroll-m-20 text-base font-semibold tracking-tight",
          className
        )}
        {...props}
      >
        {children}
      </h6>
    );
  },
  a: ({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
    <a
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("my-6 ml-6 list-disc", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("my-6 ml-6 list-decimal", className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn("mt-2", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        "mt-6 border-l-2 pl-6 italic [&>*]:text-muted-foreground",
        className
      )}
      {...props}
    />
  ),
  img: ({
    className,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={cn("rounded-md border", className)} alt={alt} {...props} />
  ),
  hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-4 md:my-8" {...props} />
  ),
  // Enhanced table component with better styling
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-8 w-full overflow-x-auto rounded-md border border-border bg-background shadow-sm">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className={cn("m-0 border-t border-border p-0 even:bg-muted/50", className)}
      {...props}
    />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        "border border-border px-4 py-3 text-left font-medium bg-muted/80 text-foreground [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn(
        "border border-border px-4 py-3 text-left text-foreground [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),
  // Simplified pre component that uses CodeBlock directly
  pre: (props: any) => {
    // Preserve the original className for styling
    const className = props.className || '';
    let language = '';
    let content = '';
    
    // Try to extract code content and language
    try {
      // If props.children is a React element with code props
      if (props.children?.props?.children && props.children?.props?.className) {
        content = props.children.props.children;
        // Extract language from className (e.g., "language-bash" -> "bash")
        const match = props.children.props.className.match(/language-(\w+)/);
        language = match ? match[1] : '';
      }
    } catch (e) {
      // If extraction fails, fall back to a regular pre
      return <pre {...props} className={cn("mb-4 mt-6 overflow-x-auto rounded-lg border p-4", className)} />;
    }
    
    // If we successfully extracted content, create a CodeBlock
    if (content) {
      return (
        <CodeBlock
          code={content}
          language={language}
          filename={isTerminalCode(content, language) ? "terminal" : undefined}
        />
      );
    }
    
    // Fallback to regular pre
    return <pre {...props} className={cn("mb-4 mt-6 overflow-x-auto rounded-lg border p-4", className)} />;
  },
  // Simplified code component
  code: (props: any) => {
    // If within a pre (has language class), just return as is
    if (props.className?.includes('language-')) {
      return <code {...props} />;
    }
    
    // For inline code, apply styling
    return (
      <code
        {...props}
        className={cn(
          "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
          props.className
        )}
      />
    );
  },
  Image,
  Callout,
  CodeBlock,
  ComponentExample,
};

interface MdxProps {
  code: string;
}

// This must be a Server Component since MDXRemote from next-mdx-remote/rsc is async
export async function Mdx({ code }: MdxProps) {
  return (
    <div className="mdx">
      <MDXRemote source={code} components={components} />
    </div>
  );
} 