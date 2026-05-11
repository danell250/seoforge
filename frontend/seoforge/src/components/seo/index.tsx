import { OrganizationSchema, WebsiteSchema, FAQPageSchema, SoftwareApplicationSchema, LocalBusinessSchema, HowToSchema, SpeakableSchema } from "./structured-data";

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
