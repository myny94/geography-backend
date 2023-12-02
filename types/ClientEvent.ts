import { z } from 'zod'

// schema of /event endpoint (client --> server)
export const ClientEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('answer'),
    questionId: z.string(),
    answer: z.string(),
  }),
  z.object({
    type: z.literal('start'),
    nickname: z.string(),
  }),
])

export type ClientEvent = z.infer<typeof ClientEventSchema>
