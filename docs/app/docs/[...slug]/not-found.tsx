import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="container flex h-[calc(100vh-10rem)] max-w-5xl flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">Page Not Found</h1>
      <p className="text-xl text-muted-foreground">
        The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Link
        href="/docs"
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          "mt-6"
        )}
      >
        Back to Documentation
      </Link>
    </div>
  );
} 