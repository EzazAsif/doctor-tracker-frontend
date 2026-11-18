"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogout, useMe } from "@/hooks/queries/use-auth";
import { cn, initials } from "@/lib/utils";

export function UserMenu({ variant = "compact" }: { variant?: "compact" | "sidebar" }) {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className={cn(
          "flex items-center gap-3 text-left outline-none transition-colors focus-visible:ring-2",
          variant === "sidebar"
            ? "w-full rounded-lg bg-sidebar-accent/60 p-2.5 text-sidebar-foreground hover:bg-sidebar-accent focus-visible:ring-sidebar-ring"
            : "rounded-full p-0.5 hover:ring-2 hover:ring-border focus-visible:ring-ring",
        )}
      >
        {isLoading ? (
          <Skeleton className="size-8 rounded-full" />
        ) : (
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            {user ? initials(user.name) : "?"}
          </span>
        )}
        {variant === "sidebar" && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-white">{user?.name ?? "Loading…"}</span>
              <span className="block truncate text-xs text-sidebar-muted">{user?.email}</span>
            </span>
            <ChevronsUpDown className="size-4 text-sidebar-muted" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={variant === "sidebar" ? "top" : "bottom"} className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <span className="block text-sm font-medium text-foreground">{user?.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout.mutate()} disabled={logout.isPending}>
          <LogOut />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
