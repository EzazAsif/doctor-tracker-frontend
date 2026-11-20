import { Activity, LayoutGrid, Shield, Stethoscope, UsersRound, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, adminOnly: true },
  { href: "/doctors", label: "Doctors", icon: Stethoscope, adminOnly: true },
  { href: "/patients", label: "Patients", icon: UsersRound },
  { href: "/activity", label: "Activity", icon: Activity, adminOnly: true },
  { href: "/staff", label: "Staff", icon: Shield, adminOnly: true },
];
