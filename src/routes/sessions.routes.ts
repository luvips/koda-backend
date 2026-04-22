import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { sessionLimiter } from '../middleware/rate-limit.middleware'
import { validate } from '../middleware/validate.middleware'
import { createSessionSchema } from '../validators/session.validators'
import { createSessionController, getMineController } from '../controllers/session.controller'

const router = Router()

// POST /sessions — guarda una sesión completada (requiere auth + rate limit)
router.post(
  '/',
  sessionLimiter,
  authenticate,
  validate(createSessionSchema),
  createSessionController
)

// GET /sessions/mine — lista las sesiones del usuario autenticado
router.get(
  '/mine',
  authenticate,
  getMineController
)

export default router