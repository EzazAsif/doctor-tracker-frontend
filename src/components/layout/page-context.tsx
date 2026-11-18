"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS, type NavItem } from "./nav-items";

/** The nav section the current route belongs to (e.g. /doctors/123 -> Doctors). */
export function useCurrentSection(): { item: NavItem | undefined; isDetail: boolean } {
  const pathname = usePathname();
  const item = NAV_ITEMS.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
  return { item, isDetail: Boolean(item && pathname !== item.href) };
}
