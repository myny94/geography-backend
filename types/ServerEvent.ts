import { z } from 'zod'

// server -> client
export const ServerEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('end_game'),
  }),
  z.object({
    type: z.literal('wrong_answer'),
    remainingLives: z.number(),
  }),
  z.object({
    type: z.literal('question'),
    questionId: z.string(),
    geoImageUrl: z.string().url(),
    remainingLives: z.number(),
  }),
  z.object({
    type: z.literal('give_hint'),
    questionId: z.string(),
    hint: z.string(),
  })
])

export type ServerEvent = z.infer<typeof ServerEventSchema>
