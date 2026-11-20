"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { useMe } from "@/hooks/queries/use-auth";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: user } = useMe();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "admin");

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
