4
import { Router, RequestHandler } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { sessionLimiter } from '../middleware/rate-limit.middleware'
import { validate } from '../middleware/validate.middleware'
import { createSessionSchema } from '../validators/session.validators'
import {createSessionController, getMineController} from '../controllers/session.controller'

const router = Router()
router.post(
  '/',
  sessionLimiter,
  authenticate as unknown as RequestHandler,
  validate(createSessionSchema),
  createSessionController as unknown as RequestHandler
)
router.get(
  '/mine', 
  authenticate as unknown as RequestHandler,
  getMineController as unknown as RequestHandler
)
export default router