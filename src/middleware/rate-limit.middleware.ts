import rateLimit from 'express-rate-limit'

// Rate limiter para endpoints de autenticación (login/register)
// Previene ataques de fuerza bruta limitando intentos por IP
// 10 intentos cada 15 minutos es suficiente para uso legítimo
// pero dificulta significativamente los ataques automatizados
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 requests por ventana
  message: {
    error: 'Demasiados intentos. Intenta en 15 minutos.',
  },
  standardHeaders: true, // Incluye headers RateLimit-* en la respuesta
  legacyHeaders: false, // Desactiva headers X-RateLimit-* antiguos
})

// Rate limiter para endpoints de sesiones de tipeo
// Más permisivo porque los usuarios legítimos pueden completar
// múltiples sesiones en una hora (especialmente en práctica intensiva)
export const sessionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 30, // Máximo 30 sesiones por hora
  message: {
    error: 'Límite de sesiones por hora alcanzado.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})
