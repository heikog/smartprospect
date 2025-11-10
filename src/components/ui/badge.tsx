import { cn } from "@/lib/utils";

const statusClasses: Record<string, string> = {
  in_erstllg: "bg-amber-100 text-amber-800",
  bereit_zur_pruefung: "bg-sky-100 text-sky-800",
  geprueft: "bg-emerald-100 text-emerald-800",
  versandt: "bg-indigo-100 text-indigo-800",
  default: "bg-slate-100 text-slate-800",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof statusClasses | "default";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        statusClasses[variant] ?? statusClasses.default,
        className,
      )}
    >
      {children}
    </span>
  );
}
