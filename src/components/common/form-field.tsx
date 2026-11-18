import { useId } from "react";
import { cn } from "@/lib/utils";

interface FieldRenderProps {
  id: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: React.ReactNode;
  optional?: boolean;
  className?: string;
  children: (props: FieldRenderProps) => React.ReactNode;
}

export function FormField({ label, error, hint, optional, className, children }: FormFieldProps) {
  const id = useId();
  const messageId = `${id}-msg`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
        </label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? messageId : undefined,
      })}
      {error && (
        <p id={messageId} role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
