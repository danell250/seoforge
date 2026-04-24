import { useEffect } from "react";
import { useGetAgencySettings } from "@workspace/api-client-react";

export function useAgencySettings() {
  const query = useGetAgencySettings();

  useEffect(() => {
    if (query.data?.primaryColor) {
      document.documentElement.style.setProperty("--brand-primary", query.data.primaryColor);
    }
    if (query.data?.brandName) {
      document.title = `${query.data.brandName} — ${query.data.tagline}`;
    }
  }, [query.data?.primaryColor, query.data?.brandName, query.data?.tagline]);

  return {
    settings: query.data ?? {
      brandName: "SEOForge",
      tagline: "AI-Powered SEO and Answer Engine Optimization",
      logoUrl: null,
      primaryColor: "#2563eb",
      supportEmail: null,
      websiteUrl: null,
    },
    isLoading: query.isLoading,
  };
}
