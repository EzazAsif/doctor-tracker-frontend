"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { useMe } from "@/hooks/queries/use-auth";

/** Thumb-reach tab bar for < lg screens; the sidebar takes over from lg up. */
export function BottomNav() {
  const pathname = usePathname();
  const { data: user } = useMe();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "admin");

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden"
    >
      <ul className="mx-auto grid max-w-2xl" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium outline-none transition-colors focus-visible:bg-muted",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0 h-0.5 w-10 rounded-full bg-primary transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <Icon className="size-5" strokeWidth={active ? 2.1 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
