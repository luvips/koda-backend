import { Router } from 'express'

// TODO: Prompt 4 — Implementar rutas de snippets de código
// Rutas previstas:
//   GET  /snippets        → listar snippets (con filtros: language, difficulty)
//   GET  /snippets/:id    → obtener un snippet por ID
//   POST /snippets        → crear snippet (solo admin)
//   PUT  /snippets/:id    → actualizar snippet (solo admin)
//   DELETE /snippets/:id  → eliminar snippet (solo admin)

const router = Router()

export default router
