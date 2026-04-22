import { z } from 'zod'
export const createSessionSchema = z.object({
  snippetId: z.string().uuid('snippetId debe ser un UUID válido'),
  correctChars: z
    .number()
    .int('correctChars debe ser un entero')
    .min(0,'correctChars no puede ser negativo'),
  totalErrors: z
    .number()
    .int('totalErrors debe ser un entero')
    .min(0,'totalErrors no puede ser negativo'),
  durationMs: z
    .number()
    .int('durationMs debe ser un entero')
    .min(1000,'durationMs mínimo es 1000ms'),
  keyErrors: z
    .array(z.string().max(5))
    .max(500,'keyErrors no puede tener más de 500 entradas')
    .default([]),
})
export type CreateSessionInput = z.infer<typeof createSessionSchema>