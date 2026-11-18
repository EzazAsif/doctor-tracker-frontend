import Image from "next/image";
import { cn } from "@/lib/utils";

export function LogoMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      priority
      className={cn("shrink-0 select-none", className)}
    />
  );
}

/**
 * Pin icon + "DoctorTracker" wordmark. tone="light" is for the navy sidebar,
 * "dark" for light backgrounds (same two-tone split as the logo file).
 */
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
    <span className={cn("flex items-center gap-2", className)}>
      {tone === "light" ? (
        // pin blends into the dark sidebar w/o this, so give it a little white tile
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white">
          <LogoMark size={30} />
        </span>
      ) : (
        <LogoMark />
      )}
      <span
        className={cn(
          "font-heading text-[19px] leading-none font-bold tracking-tight",
          hideTextOnMobile && "hidden sm:inline",
        )}
      >
        <span className={tone === "light" ? "text-white" : "text-brand-deep dark:text-white"}>Doctor</span>
        <span className={tone === "light" ? "text-brand-mint" : "text-brand-green dark:text-brand-mint"}>Tracker</span>
      </span>
    </span>
  );
}
