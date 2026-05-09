import { OrganizationSchema, WebsiteSchema, FAQPageSchema, SoftwareApplicationSchema, LocalBusinessSchema } from "./structured-data";

export function GlobalSEO() {
  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />
      <SoftwareApplicationSchema />
      <LocalBusinessSchema />
    </>
  );
}

export * from "./structured-data";
