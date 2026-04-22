// Entry point para Vercel Serverless Functions
// Vercel requiere que el handler esté en /api/
import 'dotenv/config'
import app from '../src/app'

// Exportar la app de Express como handler de Vercel
export default app
