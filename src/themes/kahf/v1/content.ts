import type { Context, Json, Values } from "quinecms/core/types";
import { safeURL } from "quinecms/core/content";
import { listRows } from "quinecms/core/lists";
export const text = (v: unknown) => (typeof v === "string" ? v : "");
export const rows = (v: unknown): Values[] => listRows(v);
export const href = (v: unknown) => (safeURL(v) ? v : undefined);
export function media(value: Json | undefined, context: Context) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const found = context.media.find((m) => m.id === value.mediaId);
  return found && safeURL(found.original.url)
    ? {
        src: found.original.url,
        alt: text(value.alt),
        mime: found.original.mime,
      }
    : undefined;
}
export function entries(context: Context, props: Values) {
  return (
    context.collections?.find((c) => c.id === props.collection)?.entries ?? []
  )
    .map((e) => {
      const values: Values = {};
      for (const [key, path] of Object.entries(props))
        if (key.endsWith("Field") && typeof path === "string")
          values[key.slice(0, -5)] = e.values?.[path] ?? null;
      return { ...e, title: text(values.title) || e.title, values };
    })
    .sort((a, b) => Number(a.values.order ?? 0) - Number(b.values.order ?? 0));
}
