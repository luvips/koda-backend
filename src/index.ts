// dotenv.config() debe ejecutarse ANTES de cualquier import que lea variables de entorno
// De lo contrario, process.env.DATABASE_URL y similares llegarían como undefined a Prisma
import 'dotenv/config'

import app from './app'
import prisma from './lib/prisma'

const PORT = process.env.PORT ?? 4000

// ─── RN-07: Archivado automático de sesiones antiguas ────────────────────────

// Marca como archived=true las sesiones con más de 24 meses de antigüedad.
// Se ejecuta una sola vez al arrancar el servidor.
// NO elimina registros — solo los marca para excluirlos de las queries activas.
async function archiveOldSessions(): Promise<void> {
  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - 24) // hace 24 meses

  const result = await prisma.typingSession.updateMany({
    where: {
      date: { lt: cutoffDate },
      archived: false,
    },
    data: { archived: true },
  })

  if (result.count > 0) {
    console.log(`${result.count} sesiones archivadas (RN-07)`)
  }
}

// Conectamos la base de datos primero y solo entonces iniciamos el servidor HTTP.
// Si la BD no está disponible, el servidor arranca en modo degradado (health check responderá "degraded")
prisma
  .$connect()
  .then(async () => {
    console.log('Base de datos conectada')

    // Ejecutar archivado automático después de conectar la BD
    // Los errores no deben impedir que el servidor arranque
    try {
      await archiveOldSessions()
    } catch (err) {
      console.warn('Advertencia: no se pudo ejecutar el archivado automático:', err)
    }
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
