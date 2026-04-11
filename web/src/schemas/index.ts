import { z } from "zod";

const HttpUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
    message: "URL must use http or https",
  });

export const LocationSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  regionId: z.string().optional(),
});

export const RecommendRequestSchema = z.object({
  location: LocationSchema.optional(),
  time_window: z.string().optional(),
  budget_per_person: z.number().positive().optional(),
  dietary: z.array(z.string()).optional(),
  party_size: z.number().int().positive().optional(),
  scene: z.string().optional(),
  preference_tags: z.array(z.string()).optional(),
});

export const SearchRestaurantsQuerySchema = z.object({
  q: z.string().optional(),
  tags: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((s) => {
      if (s === undefined || s === "") return 20;
      const n = Number.parseInt(s, 10);
      if (Number.isNaN(n)) return 20;
      return Math.min(50, Math.max(1, n));
    }),
});

export const CreateRestaurantBodySchema = z.object({
  name: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  tags: z.array(z.string()).optional(),
  capabilities: z.array(z.enum(["menu", "queue"])).optional(),
  externalUrl: HttpUrlSchema.optional(),
  provider: z.string().optional(),
  mcpStreamableUrl: HttpUrlSchema.optional(),
  skillReferenceUrl: HttpUrlSchema.optional(),
});

export const QueueJoinBodySchema = z.object({
  restaurant_id: z.string().min(1),
  party_size: z.number().int().positive().optional().default(1),
});

export const CallNextBodySchema = z.object({
  restaurant_id: z.string().min(1),
});

export type RecommendRequest = z.infer<typeof RecommendRequestSchema>;
