import type { LayoutPolicy } from "quinecms/core/layout-contract";
import { contentSpacing } from "quinecms/core/site-style";
import definition from "./definition.json";
const policy: LayoutPolicy = {
  title: (settings) => String(settings.title ?? ""),
  globals: (settings) => ({
    ...contentSpacing(settings, definition.defaults),
    theme: settings.colorMode === "dark" ? "dark" : "light",
  }),
};
export default policy;
