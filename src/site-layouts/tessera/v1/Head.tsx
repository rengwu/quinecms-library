import type { LayoutProps } from "quinecms/core/layout-contract";
export default function Head({ settings }: LayoutProps) {
  return (
    <>
      <meta name="description" content={String(settings.description ?? "")} />
      <meta
        name="theme-color"
        content={settings.colorMode === "dark" ? "#101113" : "#ffffff"}
      />
      <link rel="icon" type="image/svg+xml" href="/tessera/v1/favicon.svg" />
      <link
        rel="preload"
        href="/tessera/v1/fonts/newsreader.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  );
}
