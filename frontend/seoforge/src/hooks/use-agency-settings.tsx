import { useEffect } from "react";
import { getGetAgencySettingsQueryKey, useGetAgencySettings } from "@workspace/api-client-react";
import { useAuth } from "./use-auth";

const DEFAULT_SETTINGS = {
  brandName: "SEOaxe",
  tagline: "AI-Powered SEO and Answer Engine Optimization",
  logoUrl: null,
  primaryColor: "#2563eb",
  supportEmail: null,
  websiteUrl: null,
};

export function useAgencySettings() {
  const { isAuthenticated } = useAuth();
  const query = useGetAgencySettings({
    query: {
      enabled: isAuthenticated,
      queryKey: getGetAgencySettingsQueryKey(),
      retry: false,
    },
  });
  const settings = query.data ?? DEFAULT_SETTINGS;

  useEffect(() => {
    document.documentElement.style.setProperty("--brand-primary", settings.primaryColor);
    document.title = `${settings.brandName} — ${settings.tagline}`;
  }, [settings.brandName, settings.primaryColor, settings.tagline]);

  return {
    settings,
    isLoading: query.isLoading,
  };
}
