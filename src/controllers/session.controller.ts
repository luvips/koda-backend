import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { AuthenticatedRequest } from '../types'
import { CreateSessionInput } from '../validators/session.validators'
import { evaluateSession } from '../services/typing-engine.service'

export async function createSessionController(
  req: Request,
  res: Response
) {
  try {
    const userId = (req as AuthenticatedRequest).user.userId
    const { snippetId, correctChars, totalErrors, durationMs, keyErrors } = req.body as CreateSessionInput

    // Log para debug en producción
    console.log('[createSessionController] payload:', {
      userId,
      snippetId,
      correctChars,
      totalErrors,
      durationMs,
      keyErrors,
    })

    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
    })

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' })
    }

    const evaluation = evaluateSession({
      correctChars,
      totalErrors,
      durationMs,
      // keyErrors puede llegar undefined si el frontend no lo envía — usar [] como fallback
      keyErrors: keyErrors ?? [],
      snippetLength: snippet.code.length,
    })

    console.log('[createSessionController] evaluation:', evaluation)

    if (!evaluation.antiCheat.valid) {
      return res.status(400).json({ error: evaluation.antiCheat.reason })
    }

    const session = await prisma.typingSession.create({
      data: {
        userId,
        snippetId,
        wpm: evaluation.wpm,
        cpm: evaluation.cpm,
        precision: evaluation.precision,
        totalErrors,
        difficultKeys: evaluation.difficultKeys,
        status: evaluation.status,
      },
    })

    return res.status(201).json({
      message: 'Session saved',
      data: {
        id: session.id,
        wpm: session.wpm,
        cpm: session.cpm,
        precision: session.precision,
        status: session.status,
        difficultKeys: session.difficultKeys,
        date: session.date,
      },
    })
  } catch (error) {
    console.error('[createSessionController] Error inesperado:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getMineController(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).user.userId
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10))
    const language = req.query.language as string | undefined
    const where: {
      userId: string
      archived: boolean
      snippet?: { language: { slug: string } }
    } = {
      userId,
      archived: false,
      ...(language && {
        snippet: { language: { slug: language } },
      }),
    }
    const [total, sessions] = await Promise.all([
      prisma.typingSession.count({ where }),
      prisma.typingSession.findMany({
        where,
        include: {
          snippet: {
            include: { language: true },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return res.status(200).json({
      data: sessions,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('[getMineController] Error inesperado:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}