import { clsx } from "clsx";

export function cn(...classes: Array<string | undefined | null | false>) {
  return clsx(classes);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("de-DE").format(value);
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
