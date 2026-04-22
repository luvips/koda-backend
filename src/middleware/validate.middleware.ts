import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

// Middleware genérico para validar el body de una request con cualquier schema Zod
// Ventajas:
// - Reutilizable para cualquier endpoint
// - Limpia y transforma los datos automáticamente
// - Proporciona mensajes de error claros y estructurados
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // parse() valida y transforma los datos según el schema
      // Si falla, lanza un ZodError con detalles de cada campo inválido
      const validatedData = schema.parse(req.body)

      // Reemplazamos req.body con los datos validados y limpios
      // Esto garantiza que los controllers reciban datos tipados correctamente
      req.body = validatedData

      next()
    } catch (error) {
      // Si la validación falla, capturamos el ZodError
      if (error instanceof ZodError) {
        // Formateamos los errores de Zod en un objeto más legible
        // Ejemplo: { email: ['Email inválido'], password: ['Mínimo 8 caracteres'] }
        const fieldErrors: Record<string, string[]> = {}

        error.errors.forEach((err) => {
          const field = err.path.join('.')
          if (!fieldErrors[field]) {
            fieldErrors[field] = []
          }
          fieldErrors[field].push(err.message)
        })

        return res.status(400).json({
          error: 'Validation failed',
          details: fieldErrors,
        })
      }

      // Si es otro tipo de error, lo pasamos al error handler global
      next(error)
    }
  }
}
