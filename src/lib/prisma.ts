import { PrismaClient, Prisma } from '@prisma/client'

// Declaramos la variable global para TypeScript
// Esto evita errores de tipo al acceder a globalThis en modo desarrollo
declare global {
  var __prisma: PrismaClient | undefined
}

// Determina el nivel de logs según el entorno:
// - En desarrollo: mostramos queries, errores y advertencias para facilitar el debug
// - En producción: solo errores para no saturar los logs
const logLevels: Prisma.LogLevel[] =
  process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error']

// Patrón singleton para PrismaClient:
// tsx (hot reload en desarrollo) recrea los módulos en cada cambio,
// lo que generaría múltiples conexiones a la BD si no reutilizamos la instancia.
// Solución: en desarrollo guardamos la instancia en globalThis (persiste entre recargas).
// En producción creamos una instancia nueva directamente.
const prisma =
  process.env.NODE_ENV === 'development'
    ? (globalThis.__prisma ?? new PrismaClient({ log: logLevels }))
    : new PrismaClient({ log: logLevels })

// Guardamos la instancia en globalThis solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

export default prisma
