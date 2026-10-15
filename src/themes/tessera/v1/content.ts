import type { Context, Json, Values } from "quinecms/core/types";
import { safeURL } from "quinecms/core/content";
import { listRows } from "quinecms/core/lists";
export const text = (value: unknown) =>
  typeof value === "string" ? value : "";
export const href = (value: unknown) => (safeURL(value) ? value : undefined);
export const rows = (value: unknown): Values[] => listRows(value);
export function image(value: Json | undefined, context: Context) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const media = context.media.find((item) => item.id === value.mediaId);
  if (
    !media?.original.mime.startsWith("image/") ||
    !safeURL(media.original.url)
  )
    return;
  return { src: media.original.url, alt: text(value.alt) };
}
export function entries(context: Context, props: Values) {
  return (
    context.collections?.find((c) => c.id === props.collection)?.entries ?? []
  )
    .map((entry) => {
      const values: Values = {};
      for (const [key, source] of Object.entries(props)) {
        if (key.endsWith("Field") && typeof source === "string")
          values[key.slice(0, -5)] = entry.values?.[source] ?? null;
      }
      return { ...entry, title: text(values.title) || entry.title, values };
    })
    .sort((a, b) => {
      if (
        typeof a.values.order === "number" &&
        typeof b.values.order === "number"
      )
        return a.values.order - b.values.order;
      return text(b.values.date).localeCompare(text(a.values.date));
    });
}
