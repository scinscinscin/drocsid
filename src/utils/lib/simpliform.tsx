import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

export function simpliform<T extends FieldValues>(form: UseFormReturn<T, any, undefined>) {
  return (opts: { field: keyof T; required?: boolean; placeholder: string; type?: "text" | "password" }) => {
    return {
      ...form.register(opts.field as FieldPath<T>),
      required: opts.required ?? true,
      placeholder: opts.placeholder,
      type: opts.type ?? (opts.field.toString().toLowerCase().includes("password") ? "password" : "text"),
    };
  };
}
