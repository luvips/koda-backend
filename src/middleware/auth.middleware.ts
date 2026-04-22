import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'
import { AuthenticatedRequest } from '../types'

// Middleware para proteger rutas que requieren autenticación
// Verifica que el usuario tenga un JWT válido en el header Authorization
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Extraemos el header Authorization
  // Formato esperado: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  const authHeader = req.headers.authorization

  // Si no hay header Authorization, el usuario no está autenticado
  if (!authHeader) {
    return res.status(401).json({ error: 'Token required' })
  }

  // Extraemos el token del formato "Bearer <token>"
  const token = authHeader.split(' ')[1]

  // Si el formato es incorrecto (no hay token después de "Bearer")
  if (!token) {
    return res.status(401).json({ error: 'Token required' })
  }

  // Verificamos y decodificamos el token usando nuestro helper JWT
  // verifyToken retorna null si el token es inválido o ha expirado
  const payload = verifyToken(token)

  if (!payload) {
    // Token inválido, expirado o manipulado
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  // Token válido: adjuntamos el payload al request para que los controllers
  // puedan acceder a la información del usuario autenticado (userId, email)
  // Casteamos a AuthenticatedRequest para poder asignar req.user
  ;(req as AuthenticatedRequest).user = payload

  next()
}
