import { OrganizationSchema, WebsiteSchema, FAQPageSchema, SoftwareApplicationSchema, LocalBusinessSchema } from "./structured-data";

export function GlobalSEO() {
  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />
      <FAQPageSchema />
      <SoftwareApplicationSchema />
      <LocalBusinessSchema />
    </>
  );
}

export * from "./structured-data";
