import { Router } from 'express'
import { registerController, loginController } from '../controllers/auth.controller'
import { validate } from '../middleware/validate.middleware'
import { registerSchema, loginSchema } from '../validators/auth.validators'
import { authLimiter } from '../middleware/rate-limit.middleware'

const router = Router()

// POST /auth/register
// Registra un nuevo usuario en el sistema
// Middlewares aplicados en orden:
// 1. authLimiter: previene spam de registros (10 intentos / 15 min)
// 2. validate(registerSchema): valida formato de name, email y password
// 3. registerController: lógica de negocio (verificar email único, hashear password, crear usuario)
router.post('/register', authLimiter, validate(registerSchema), registerController)

// POST /auth/login
// Autentica un usuario existente y retorna un JWT
// Middlewares aplicados en orden:
// 1. authLimiter: previene ataques de fuerza bruta (10 intentos / 15 min)
// 2. validate(loginSchema): valida formato de email y password
// 3. loginController: verifica credenciales y genera token
router.post('/login', authLimiter, validate(loginSchema), loginController)

export default router
