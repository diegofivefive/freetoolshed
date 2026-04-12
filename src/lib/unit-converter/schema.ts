import { z } from "zod";

export const conversionInputSchema = z.object({
  value: z.number().finite(),
  fromUnitId: z.string().min(1),
  toUnitId: z.string().min(1),
});

export const favoritePairSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  fromUnitId: z.string().min(1),
  toUnitId: z.string().min(1),
  label: z.string().min(1),
});

export const persistedStateSchema = z.object({
  category: z.string().min(1),
  fromUnitId: z.string().min(1),
  toUnitId: z.string().min(1),
  favorites: z.array(favoritePairSchema).max(12),
  showFormula: z.boolean(),
  showGraph: z.boolean(),
  showScale: z.boolean(),
});

export type PersistedState = z.infer<typeof persistedStateSchema>;
