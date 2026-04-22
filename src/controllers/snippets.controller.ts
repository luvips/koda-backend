import { Request, Response } from 'express'
import { z, ZodError } from 'zod'
import { snippetQuerySchema } from '../validators/snippet.validators'
import { getRandomSnippet, getSnippetById } from '../services/snippets.service'

export async function getSnippetsController(req: Request, res: Response) {
  try {
    const query = snippetQuerySchema.parse(req.query)
    const snippet = await getRandomSnippet(query.language ?? '', query.difficulty)
    if (!snippet) {
      return res.status(404).json({
        error: 'No snippets found for the given filters',
      })
    }
    
    return res.status(200).json({
      data: {
        id: snippet.id,
        code: snippet.code,
        difficulty: snippet.difficulty,
        tags: snippet.tags,
        language: {
          name: snippet.language.name,
          slug: snippet.language.slug,
          icon: snippet.language.icon,
        },
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {}
      error.errors.forEach((err: z.ZodIssue) => {
        const field = err.path.join('.') || 'query'
        if (!fieldErrors[field]) fieldErrors[field] = []
        fieldErrors[field].push(err.message)
      })
      return res.status(400).json({
        error: 'Validation failed',
        details: fieldErrors,
      })
    }
    console.error('[getSnippetsController] Error inesperado:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getSnippetByIdController(req: Request, res: Response) {
  try { 
        const uuidSchema = z.string().uuid('ID inválido: debe ser un UUID')
        const parseResult = uuidSchema.safeParse(req.params.id)
        if (!parseResult.success) {
        return res.status(400).json({
            error: parseResult.error.errors[0].message,
        })
        }
        const snippet = await getSnippetById(parseResult.data)

        if (!snippet) {
        return res.status(404).json({ error: 'Snippet not found' })
        }
        return res.status(200).json({
        data: {
            id: snippet.id,
            code: snippet.code,
            difficulty: snippet.difficulty,
            tags: snippet.tags,
            language: {
            name: snippet.language.name,
            slug: snippet.language.slug,
            icon: snippet.language.icon,
            },
        },
        })
    } catch (error) {
    console.error('[getSnippetByIdController] Error inesperado:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}