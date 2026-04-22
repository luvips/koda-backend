// Entry point para Vercel Serverless
// Este archivo debe estar en /api/ para que Vercel lo reconozca
import 'dotenv/config'
import app from '../src/app'

// Exportar la app de Express como handler serverless
export default app
