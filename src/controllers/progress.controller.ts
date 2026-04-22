import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../types'
import prisma from '../lib/prisma'

// Controller para obtener el resumen de progreso del usuario autenticado
// Requiere JWT válido — el middleware de auth adjunta req.user antes de llegar aquí
export async function getSummaryController(req: Request, res: Response) {
  try {
    // Casteamos a AuthenticatedRequest porque el middleware authenticate
    // garantiza que req.user existe en este punto
    const userId = (req as AuthenticatedRequest).user.userId

    // Fecha de corte para los últimos 7 días
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Fecha de corte para los últimos 30 días (historial de gráfica)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Ejecutamos todas las queries en paralelo para minimizar latencia
    // Promise.all garantiza que todas se lancen simultáneamente
    const [
      recentSessions,
      bestSession,
      totalSessions,
      completedSessions,
      allCompletedWithLanguage,
      historySessions,
    ] = await Promise.all([

      // Query 1 — Sesiones COMPLETED de los últimos 7 días para calcular WPM promedio
      prisma.typingSession.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          archived: false,
          date: { gte: sevenDaysAgo },
        },
        select: { wpm: true },
      }),

      // Query 2 — Mejor WPM de todos los tiempos (primera sesión ordenada por wpm desc)
      prisma.typingSession.findFirst({
        where: {
          userId,
          status: 'COMPLETED',
          archived: false,
        },
        orderBy: { wpm: 'desc' },
        select: { wpm: true },
      }),

      // Query 3 — Total de sesiones del usuario (sin importar estado)
      prisma.typingSession.count({
        where: {
          userId,
          archived: false,
        },
      }),

      // Query 4 — Sesiones completadas del usuario
      prisma.typingSession.count({
        where: {
          userId,
          status: 'COMPLETED',
          archived: false,
        },
      }),

      // Query 5 — Todas las sesiones COMPLETED con su snippet y lenguaje
      // Se usa para calcular el lenguaje favorito por frecuencia
      prisma.typingSession.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          archived: false,
        },
        select: {
          snippet: {
            select: {
              language: {
                select: { slug: true },
              },
            },
          },
        },
      }),

      // Query 6 — Sesiones COMPLETED de los últimos 30 días para el historial de gráfica
      prisma.typingSession.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          archived: false,
          date: { gte: thirtyDaysAgo },
        },
        select: {
          wpm: true,
          date: true,
        },
        orderBy: { date: 'asc' },
      }),
    ])

    // ── Calcular WPM promedio de los últimos 7 días ───────────────────────────
    // Si no hay sesiones recientes, el promedio es 0
    const avgWpm7Days =
      recentSessions.length > 0
        ? Math.round(
            recentSessions.reduce((sum, s) => sum + s.wpm, 0) / recentSessions.length
          )
        : 0

    // ── Mejor WPM de todos los tiempos ────────────────────────────────────────
    const bestWpm = bestSession ? Math.round(bestSession.wpm) : 0

    // ── Lenguaje favorito ─────────────────────────────────────────────────────
    // Contamos cuántas sesiones tiene cada slug de lenguaje
    const languageCounts: Record<string, number> = {}
    for (const session of allCompletedWithLanguage) {
      const slug = session.snippet.language.slug
      languageCounts[slug] = (languageCounts[slug] ?? 0) + 1
    }

    // El lenguaje favorito es el que tiene más sesiones
    // Si no hay sesiones, retornamos null
    let favoriteLanguage: string | null = null
    let maxCount = 0
    for (const [slug, count] of Object.entries(languageCounts)) {
      if (count > maxCount) {
        maxCount = count
        favoriteLanguage = slug
      }
    }

    // ── Historial de los últimos 30 días agrupado por fecha ───────────────────
    // Agrupamos las sesiones por fecha (YYYY-MM-DD) y calculamos el WPM promedio
    const historyMap: Record<string, { totalWpm: number; sessions: number }> = {}

    for (const session of historySessions) {
      // Convertimos la fecha a YYYY-MM-DD ignorando la hora
      const dateKey = session.date.toISOString().split('T')[0]

      if (!historyMap[dateKey]) {
        historyMap[dateKey] = { totalWpm: 0, sessions: 0 }
      }

      historyMap[dateKey].totalWpm += session.wpm
      historyMap[dateKey].sessions += 1
    }

    // Convertimos el mapa a array ordenado por fecha ascendente
    // Los días sin sesiones no se incluyen (solo días con actividad real)
    const recentHistory = Object.entries(historyMap)
      .map(([date, data]) => ({
        date,
        avgWpm: Math.round(data.totalWpm / data.sessions),
        sessions: data.sessions,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // ── Respuesta final ───────────────────────────────────────────────────────
    return res.status(200).json({
      data: {
        avgWpm7Days,
        bestWpm,
        totalSessions,
        completedSessions,
        favoriteLanguage,
        recentHistory,
      },
    })
  } catch (error) {
    console.error('[getSummaryController] Error inesperado:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
