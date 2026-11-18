import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api/client";

/**
 * Push a 400/409 from the API onto the matching form fields.
 * Returns true when at least one field error was applied.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
): boolean {
  if (!(error instanceof ApiError)) return false;

  let applied = false;
  for (const detail of error.details) {
    const field = detail.path.split(".")[0];
    if (fields.includes(field)) {
      setError(field as Path<T>, { type: "server", message: detail.message });
      applied = true;
    }
  }

  // duplicate email comes back as a 409 without field details
  if (!applied && error.code === "CONFLICT" && fields.includes("email")) {
    setError("email" as Path<T>, { type: "server", message: error.message || "Email is already in use" });
    applied = true;
  }

  return applied;
}

export const PHONE_RE = /^[0-9+\-()\s]{7,20}$/;
