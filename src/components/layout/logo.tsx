import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  tone = "light",
  hideTextOnMobile = false,
}: {
  className?: string;
  tone?: "light" | "dark";
  hideTextOnMobile?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-heading text-[17px] font-semibold tracking-tight",
          tone === "light" ? "text-white" : "text-foreground",
          hideTextOnMobile && "hidden sm:inline",
        )}
      >
        Doctor Tracker
      </span>
    </span>
  );
}
