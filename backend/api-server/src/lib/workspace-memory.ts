import { DEFAULT_AGENCY_SETTINGS } from "@workspace/api-zod";
import { agencySettingsTable } from "@workspace/db";
import { getAgencySettingsRow } from "./agency-settings";
import { isMissingRelationError } from "./db-errors";

export interface WorkspaceMemory {
  brandName: string;
  tagline: string;
  brandVoice: string;
  preferredMarkets: string;
  primaryCms: string;
  optimizationStyle: string;
}

export async function getWorkspaceMemory(): Promise<WorkspaceMemory> {
  try {
    const row = await getAgencySettingsRow();
    return normalizeWorkspaceMemory(row);
  } catch (error) {
    if (isMissingRelationError(error, "agency_settings")) {
      return normalizeWorkspaceMemory(null);
    }
    throw error;
  }
}

export function normalizeWorkspaceMemory(
  row: typeof agencySettingsTable.$inferSelect | null | undefined,
): WorkspaceMemory {
  return {
    brandName: row?.brandName ?? DEFAULT_AGENCY_SETTINGS.brandName,
    tagline: row?.tagline ?? DEFAULT_AGENCY_SETTINGS.tagline,
    brandVoice: row?.brandVoice ?? DEFAULT_AGENCY_SETTINGS.brandVoice,
    preferredMarkets: row?.preferredMarkets ?? DEFAULT_AGENCY_SETTINGS.preferredMarkets,
    primaryCms: row?.primaryCms ?? DEFAULT_AGENCY_SETTINGS.primaryCms,
    optimizationStyle: row?.optimizationStyle ?? DEFAULT_AGENCY_SETTINGS.optimizationStyle,
  };
}

export function buildWorkspaceMemoryPrompt(memory: WorkspaceMemory): string {
  return [
    "SEOAXE WORKSPACE MEMORY",
    `Brand: ${memory.brandName}`,
    `Tagline: ${memory.tagline}`,
    `Brand voice: ${memory.brandVoice}`,
    `Preferred markets: ${memory.preferredMarkets}`,
    `Primary CMS / publishing stack: ${memory.primaryCms}`,
    `Optimization style: ${memory.optimizationStyle}`,
    "- Respect these preferences when choosing tone, examples, and implementation emphasis.",
    "- Keep outputs aligned with the workspace's publishing context and audience expectations.",
  ].join("\n");
}
