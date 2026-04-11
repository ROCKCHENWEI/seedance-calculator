import type { Restaurant } from "@prisma/client";
import { parseJsonArray } from "@/lib/json";

/** Fields exposed on list/detail API for agents. */
export function restaurantPublic(r: Restaurant) {
  return {
    id: r.id,
    name: r.name,
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    tags: parseJsonArray(r.tags),
    capabilities: parseJsonArray(r.capabilities),
    provider: r.provider,
    external_url: r.externalUrl,
    mcp_streamable_url: r.mcpStreamableUrl,
    skill_reference_url: r.skillReferenceUrl,
  };
}
