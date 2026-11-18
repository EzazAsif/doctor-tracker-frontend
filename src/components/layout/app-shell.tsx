"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { BottomNav } from "./bottom-nav";
import { Logo } from "./logo";
import { useCurrentSection } from "./page-context";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

function SidebarBody() {
  return (
    <div className="flex h-full flex-col gap-8 px-4 py-6">
      <Link
        href="/dashboard"
        className="self-start rounded-lg px-1 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <Logo />
      </Link>
      <div>
        <SidebarNav />
      </div>
      <div className="mt-auto">
        <UserMenu variant="sidebar" />
      </div>
    </div>
  );
}

/** Where-am-I cue: breadcrumb on desktop, current page next to the logo mark on mobile. */
function HeaderLocation() {
  const { item, isDetail } = useCurrentSection();
  if (!item) return null;
  const Icon = item.icon;

  return (
    <>
      <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm lg:flex">
        <span className="text-sidebar-muted">Doctor Tracker</span>
        <ChevronRight className="size-3.5 text-sidebar-muted/60" />
        {isDetail ? (
          <>
            <Link href={item.href} className="text-sidebar-muted transition-colors hover:text-white">
              {item.label}
            </Link>
            <ChevronRight className="size-3.5 text-sidebar-muted/60" />
            <span aria-current="page" className="font-medium text-white">Details</span>
          </>
        ) : (
          <span aria-current="page" className="font-medium text-white">{item.label}</span>
        )}
      </nav>
      <span className="flex min-w-0 items-center gap-1.5 truncate text-[15px] font-medium text-white lg:hidden">
        <Icon className="size-4 shrink-0 text-brand-mint" strokeWidth={1.9} />
        {item.label}
      </span>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:pl-64">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-sidebar lg:block">
        <SidebarBody />
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/5 bg-sidebar px-4 text-sidebar-foreground shadow-sm sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring lg:hidden"
          aria-label="Doctor Tracker home"
        >
          <Logo hideTextOnMobile />
        </Link>
        <span aria-hidden className="h-5 w-px bg-white/15 lg:hidden" />
        <HeaderLocation />
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <time dateTime={new Date().toISOString()} suppressHydrationWarning className="mr-2 hidden text-xs text-sidebar-muted md:block">
            {format(new Date(), "EEE, d MMM yyyy")}
          </time>
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-28 outline-none sm:px-6 lg:px-8 lg:pt-8 lg:pb-16">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
