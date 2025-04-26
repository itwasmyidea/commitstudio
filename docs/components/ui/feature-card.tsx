import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
  href: string;
  title: string;
  description: string;
}

export function FeatureCard({ href, title, description }: FeatureCardProps) {
  return (
    <Link href={href} className="relative overflow-hidden rounded-lg border bg-background p-2 transition-colors hover:bg-muted/25">
      <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
        <div className="space-y-2">
          <h3 className="font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="text-sm text-muted-foreground/60 flex items-center">
          <ArrowRight className="h-4 w-4 ml-auto" />
        </div>
      </div>
    </Link>
  );
} 