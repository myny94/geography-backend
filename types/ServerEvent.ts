import { z } from 'zod'

// server -> client
export const ServerEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('end_game'),
  }),
  z.object({
    type: z.literal('question'),
    questionId: z.string(),
    geoImageUrl: z.string().url(),
  }),
])

export type ServerEvent = z.infer<typeof ServerEventSchema>
