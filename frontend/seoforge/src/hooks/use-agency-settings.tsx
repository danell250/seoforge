import { useEffect } from "react";
import { getGetAgencySettingsQueryKey, useGetAgencySettings } from "@workspace/api-client-react";
import { DEFAULT_AGENCY_SETTINGS, normalizeBrandName } from "../../../../lib/api-zod/src/brand";
import { useAuth } from "./use-auth";

export function useAgencySettings() {
  const { isAuthenticated } = useAuth();
  const query = useGetAgencySettings({
    query: {
      enabled: isAuthenticated,
      queryKey: getGetAgencySettingsQueryKey(),
      retry: false,
    },
  });
  const settings = query.data
    ? {
        ...query.data,
        brandName: normalizeBrandName(query.data.brandName),
      }
    : DEFAULT_AGENCY_SETTINGS;

  useEffect(() => {
    document.documentElement.style.setProperty("--brand-primary", settings.primaryColor);
    document.title = `${settings.brandName} — ${settings.tagline}`;
  }, [settings.brandName, settings.primaryColor, settings.tagline]);

  return {
    settings,
    isLoading: query.isLoading,
  };
}
