"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/queries/use-auth";
import { ApiError, errorMessage } from "@/lib/api/client";

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type Values = z.infer<typeof schema>;

function safeNext(next: string | null) {
  // only allow same-site relative paths
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) return "/dashboard";
  return next;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    login.mutate(values, {
      onSuccess: () => {
        router.replace(safeNext(searchParams.get("next")));
        router.refresh();
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) setFormError("That email and password don't match.");
        else if (error instanceof ApiError && error.status === 429)
          setFormError("Too many attempts. Wait a few minutes and try again.");
        else setFormError(errorMessage(error));
      },
    });
  });

  return (
    <div>
      <h2 className="text-3xl font-semibold">Sign in</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">Admin access only. Use your Doctor Tracker account.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-5">
        {formError && (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-sm text-destructive">
            {formError}
          </div>
        )}

        <FormField label="Email" error={errors.email?.message}>
          {(field) => (
            <Input
              {...field}
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="you@hospital.com"
              className="h-11 bg-card"
            />
          )}
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          {(field) => (
            <div className="relative">
              <Input
                {...field}
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 bg-card pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          )}
        </FormField>

        <Button type="submit" size="lg" className="mt-1 h-11 text-[15px]" disabled={login.isPending}>
          {login.isPending ? <Loader2 className="animate-spin" /> : null}
          {login.isPending ? "Signing in…" : "Sign in"}
          {!login.isPending && <ArrowRight data-icon="inline-end" />}
        </Button>
      </form>

    </div>
  );
}
