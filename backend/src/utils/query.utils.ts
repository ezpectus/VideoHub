import { ParsedQs } from "qs";


export function toString(
  value: unknown
): string | undefined {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : undefined;
  }

  if (typeof value === "string") return value;

  return undefined;
}