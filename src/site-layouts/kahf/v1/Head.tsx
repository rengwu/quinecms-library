import type { LayoutProps } from "quinecms/core/layout-contract";
export default function Head({ settings }: LayoutProps) {
  return (
    <>
      <meta name="description" content={String(settings.description ?? "")} />
      <meta name="theme-color" content="#555e49" />
      <link
        rel="preload"
        href="/kahf/v1/29d20f8568-a4f36f750ee3b0bb-s.p.woff"
        as="font"
        type="font/woff"
        crossOrigin="anonymous"
      />
    </>
  );
}
