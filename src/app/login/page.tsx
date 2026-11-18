import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { Logo } from "@/components/layout/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

function PreviewCard() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-xs font-medium text-emerald-50">
          <span className="size-1.5 rounded-full bg-brand-mint" />
          Patients over time
        </span>
        <span className="ml-auto text-xs text-white/45">Last 12 months</span>
      </div>
      <svg viewBox="0 0 400 120" className="mt-4 h-28 w-full" aria-hidden>
        <defs>
          <linearGradient id="login-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5fd3b4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5fd3b4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[30, 60, 90].map((y) => (
          <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="white" strokeOpacity="0.06" />
        ))}
        <path
          d="M0 98 C40 92 60 80 100 74 S170 58 200 60 S260 52 290 40 S350 22 400 26 L400 120 L0 120 Z"
          fill="url(#login-fill)"
        />
        <path
          d="M0 98 C40 92 60 80 100 74 S170 58 200 60 S260 52 290 40 S350 22 400 26"
          fill="none"
          stroke="#5fd3b4"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="290" cy="40" r="9" fill="#5fd3b4" fillOpacity="0.2" />
        <circle cx="290" cy="40" r="4" fill="#5fd3b4" />
      </svg>
      <div className="mt-3 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-white">
        {[
          ["Doctors", "Roster"],
          ["Patients", "Caseloads"],
          ["Insights", "Live charts"],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-xs text-white/50">{k}</p>
            <p className="mt-0.5 text-sm font-medium text-white/85">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-sidebar px-12 py-10 text-white lg:flex lg:flex-col xl:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -bottom-40 size-[640px] rounded-full border border-white/[0.06]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-20 size-[440px] rounded-full border border-white/[0.06]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 -left-32 size-[420px] rounded-full bg-[#5fd3b4]/10 blur-3xl"
        />

        <Logo />

        <div className="relative my-auto max-w-xl py-12">
          <h1 className="font-heading text-5xl leading-[1.02] font-semibold tracking-tight xl:text-6xl">
            Every doctor.
            <br />
            Every patient.
            <br />
            <span className="text-brand-mint">One calm view.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/65">
            Manage your practitioners, keep caseloads balanced and see admissions trend at a glance.
          </p>
          <div className="mt-10 max-w-md">
            <PreviewCard />
          </div>
        </div>

        <p className="relative text-xs text-white/40">Secure admin portal · Session cookies are httpOnly</p>
      </section>

      <section className="flex flex-col px-5 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-6 sm:py-10">
          <div className="mb-8 self-start rounded-2xl dark:bg-white dark:p-3">
            <Image
              src="/logo.png"
              alt="DoctorTracker"
              width={900}
              height={849}
              priority
              className="h-auto w-[168px] sm:w-[188px]"
            />
          </div>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
