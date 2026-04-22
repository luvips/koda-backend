import { Router } from 'express'
import { getSummaryController } from '../controllers/progress.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

// GET /progress/summary
// Retorna estadísticas y historial del usuario autenticado
// Requiere JWT válido en el header Authorization: Bearer <token>
router.get('/summary', authenticate, getSummaryController)

export default router
