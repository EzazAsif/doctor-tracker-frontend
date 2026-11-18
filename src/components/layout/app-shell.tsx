"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-8 px-4 py-6">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="self-start rounded-lg px-1 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <Logo />
      </Link>
      <div>
        <SidebarNav onNavigate={onNavigate} />
      </div>
      <div className="mt-auto">
        <UserMenu variant="sidebar" />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-sidebar lg:block">
        <SidebarBody />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 max-w-[85vw] border-none bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 bg-sidebar px-4 text-sidebar-foreground sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon-lg"
          className="text-white hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </Button>
        <Link href="/dashboard" className="rounded-lg lg:hidden" aria-label="Doctor Tracker home">
          <Logo hideTextOnMobile />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-8">{children}</main>
    </div>
  );
}
