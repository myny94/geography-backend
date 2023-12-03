import { z } from 'zod'

export const GeoJSONSchema = z.object({
  type: z.literal('Feature'),
  properties: z.object({
    'ne:region_un': z.string(),
    'name:eng_x_preferred': z.array(z.string()),
    'name:eng_x_variant': z.array(z.string()).nullable(),
  }),
  geometry: z.discriminatedUnion('type', [
    z.object({
      coordinates: z.tuple([z.number(), z.number()]),
      type: z.literal('Point'),
    }),
    z.object({
      coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
      type: z.literal('Polygon'),
    }),
    z.object({
      coordinates: z.array(z.array(z.array(z.tuple([z.number(), z.number()])))),
      type: z.literal('MultiPolygon'),
    }),
  ]),
})

export type GeoJSONData = z.infer<typeof GeoJSONSchema>
