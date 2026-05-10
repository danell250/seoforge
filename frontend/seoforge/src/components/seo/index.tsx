import { OrganizationSchema, WebsiteSchema, FAQPageSchema, SoftwareApplicationSchema, LocalBusinessSchema, HowToSchema, SpeakableSchema } from "./structured-data";

export function GlobalSEO() {
  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />
      <SoftwareApplicationSchema />
      <LocalBusinessSchema />
      <FAQPageSchema />
    </>
  );
}

export * from "./structured-data";
