import type { LayoutPolicy } from "quinecms/core/layout-contract";
const policy: LayoutPolicy = {
  title: (settings) => String(settings.title ?? "Kahf"),
};
export default policy;
