// dotenv.config() debe ejecutarse ANTES de cualquier import que lea variables de entorno
// De lo contrario, process.env.DATABASE_URL y similares llegarían como undefined a Prisma
import 'dotenv/config'

import app from './app'
import prisma from './lib/prisma'

const PORT = process.env.PORT ?? 4000

// Conectamos la base de datos primero y solo entonces iniciamos el servidor HTTP.
// Si la BD no está disponible, el servidor arranca en modo degradado (health check responderá "degraded")
prisma
  .$connect()
  .then(() => {
    console.log('Base de datos conectada')
  })
  .catch((err: Error) => {
    console.warn('Advertencia: BD no disponible, servidor en modo degradado:', err.message)
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Servidor en puerto ${PORT}`)
      console.log(`Entorno: ${process.env.NODE_ENV ?? 'development'}`)
    })
  })

// ─── Cierre limpio ───────────────────────────────────────────────────────────

// SIGTERM: señal estándar de apagado (Docker stop, Kubernetes, etc.)
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido — cerrando conexión a BD')
  prisma.$disconnect()
})

// SIGINT: Ctrl+C en desarrollo
process.on('SIGINT', () => {
  console.log('SIGINT recibido — cerrando conexión a BD')
  prisma.$disconnect()
})
