import { Router } from 'express'

// TODO: Prompt 3 — Implementar rutas de autenticación
// Rutas previstas:
//   POST /auth/register  → registrar nuevo usuario
//   POST /auth/login     → iniciar sesión, retorna JWT
//   POST /auth/logout    → invalidar sesión (opcional con blacklist)
//   GET  /auth/me        → retorna datos del usuario autenticado

const router = Router()

export default router
