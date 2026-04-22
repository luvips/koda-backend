import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// GET /health
// Endpoint público para verificar el estado del servidor y la conexión a la BD.
// Útil para health checks de infraestructura (load balancers, Docker, etc.)
router.get('/', async (_req: Request, res: Response) => {
  // Intentamos ejecutar una query mínima para verificar que la BD responde
  let dbStatus: 'connected' | 'disconnected' = 'disconnected'

  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = 'connected'
  } catch {
    // Si la query falla, la BD no está disponible pero el servidor sigue respondiendo
    dbStatus = 'disconnected'
  }

  // Si la BD no responde, el estado general es "degraded" (servidor vivo pero sin BD)
  const status = dbStatus === 'connected' ? 'ok' : 'degraded'

  res.status(200).json({
    status,
    db: dbStatus,
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  })
})

export default router
