import { Request } from 'express'

// Payload que se almacena dentro del JWT
export interface TokenPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

// Extiende el Request de Express para incluir el usuario autenticado
// Se usa en rutas protegidas después de pasar por el middleware de autenticación
export interface AuthenticatedRequest extends Request {
  user: TokenPayload
}

// Respuesta genérica de la API — T es el tipo del campo data
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

// Niveles de dificultad de los snippets de código
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

// Estado posible de una sesión de tipeo
export type SessionStatus = 'COMPLETED' | 'INVALID' | 'INCOMPLETE'
