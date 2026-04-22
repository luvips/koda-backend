import jwt from 'jsonwebtoken'
import { TokenPayload } from '../types'

// Obtenemos el secreto JWT de las variables de entorno
// Si no está definido en producción, el servidor no debería arrancar
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_secret_inseguro'

// Genera un token JWT firmado con el payload del usuario
// El token expira en 24 horas
export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

// Verifica y decodifica un token JWT
// Retorna el payload si el token es válido, o null si es inválido/expirado
// No lanza excepciones — el caller decide cómo manejar el null
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as TokenPayload
  } catch {
    // Token inválido, expirado o malformado
    return null
  }
}
