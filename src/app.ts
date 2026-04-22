import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'

// Importamos los routers — los de rutas futuras están vacíos por ahora
import healthRouter from './routes/health.routes'
import authRouter from './routes/auth.routes'
import snippetsRouter from './routes/snippets.routes'
import sessionsRouter from './routes/sessions.routes'
import progressRouter from './routes/progress.routes'

const app = express()

// ─── Middlewares de seguridad y parseo ───────────────────────────────────────

// 1. helmet: agrega headers HTTP de seguridad (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet())

// 2. cors: permite peticiones solo desde el frontend configurado en FRONTEND_URL
//    credentials: true es necesario para enviar cookies/headers de autorización
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

// 3. Parseo de JSON con límite de 10kb para prevenir payloads excesivamente grandes
app.use(express.json({ limit: '10kb' }))

// 4. Parseo de formularios URL-encoded (por si algún cliente lo necesita)
app.use(express.urlencoded({ extended: true }))

// 5. Logger simple sin dependencias externas
//    Registra método, ruta y timestamp de cada petición entrante
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ─── Rutas ───────────────────────────────────────────────────────────────────

app.use('/api/v1/health', healthRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/snippets', snippetsRouter)
app.use('/api/v1/sessions', sessionsRouter)
app.use('/api/v1/progress', progressRouter)

// ─── Handler 404 ─────────────────────────────────────────────────────────────

// Si ninguna ruta coincide, respondemos con 404
// Debe ir después de todas las rutas registradas
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

// ─── Handler de errores global ───────────────────────────────────────────────

// Captura cualquier error no manejado que llegue con next(err)
// La firma de 4 parámetros es obligatoria para que Express lo reconozca como error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error no manejado:', err)

  // En producción ocultamos el stack trace para no exponer detalles internos
  // En desarrollo lo incluimos para facilitar el debug
  const isDev = process.env.NODE_ENV === 'development'

  res.status(500).json({
    error: 'Internal server error',
    ...(isDev && { stack: err.stack }),
  })
})

export default app
