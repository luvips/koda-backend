import { z } from 'zod'

export const snippetQuerySchema = z.object({
  language: z
    .string()
    .min(1,'El language no puede estar vacío')
    .max(50,'El language es demasiado largo')
    .optional(),

  difficulty: z
    .enum(['EASY', 'MEDIUM', 'HARD'], {
      errorMap: () => ({ message: 'difficulty debe ser EASY, MEDIUM o HARD',
      }),
    })
    .optional(),

  limit: z.coerce
    .number()
    .int('limit debe ser un entero')
    .min(1,'limit mínimo es 1')
    .max(10,'limit máximo es 10')
    .default(1),
})
export type SnippetQuery = z.infer<typeof snippetQuerySchema>