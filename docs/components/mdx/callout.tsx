import { cn } from "@/lib/utils";

interface CalloutProps {
  icon?: string;
  children?: React.ReactNode;
  type?: "default" | "warning" | "danger" | "info";
  className?: string;
}

export function Callout({
  children,
  icon,
  type = "default",
  className,
  ...props
}: CalloutProps) {
  return (
    <div
      className={cn(
        "my-6 flex items-start rounded-md border border-l-4 p-4",
        {
          "border-l-sky-500 bg-sky-50 dark:border-l-sky-500 dark:bg-sky-950/20":
            type === "info",
          "border-l-red-500 bg-red-50 dark:border-l-red-500 dark:bg-red-950/20":
            type === "danger",
          "border-l-yellow-500 bg-yellow-50 dark:border-l-yellow-500 dark:bg-yellow-950/20":
            type === "warning",
        },
        className
      )}
      {...props}
    >
      {icon && <span className="mr-4 text-2xl">{icon}</span>}
      <div>{children}</div>
    </div>
  );
} 