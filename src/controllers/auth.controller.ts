import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { signToken } from '../lib/jwt'
import { RegisterInput, LoginInput } from '../validators/auth.validators'

// Controller para registro de nuevos usuarios
export async function registerController(req: Request, res: Response) {
  try {
    // El body ya está validado por el middleware validate()
    const { name, email, password } = req.body as RegisterInput

    // 1. Verificar que el email no esté registrado
    // Importante: usar findUnique en lugar de findFirst para aprovechar el índice único
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // 409 Conflict es el código apropiado para recursos duplicados
      return res.status(409).json({
        error: 'Email already registered',
      })
    }

    // 2. Hashear la contraseña con bcrypt
    // 12 rounds de salt es el estándar recomendado (balance seguridad/performance)
    // Nunca almacenamos contraseñas en texto plano
    const hashedPassword = await bcrypt.hash(password, 12)

    // 3. Crear el usuario en la base de datos
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      // Seleccionamos solo los campos que queremos retornar
      // NUNCA incluir el password en la respuesta
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    // 4. Generar JWT para autenticación inmediata después del registro
    const token = signToken({
      userId: user.id,
      email: user.email,
    })

    // 5. Responder con 201 Created y los datos del usuario + token
    res.status(201).json({
      message: 'User created',
      data: {
        user,
        token,
      },
    })
  } catch (error) {
    console.error('Error en registerController:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Controller para login de usuarios existentes
export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body as LoginInput

    // 1. Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // 2. Si el usuario no existe, retornamos error genérico
    // IMPORTANTE: No revelamos si el email existe o no por seguridad
    // Esto previene enumeración de usuarios (user enumeration attack)
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      })
    }

    // 3. Verificar que la contraseña coincida con el hash almacenado
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      // Mismo mensaje de error que cuando el usuario no existe
      // Esto previene que un atacante sepa si el email existe
      return res.status(401).json({
        error: 'Invalid credentials',
      })
    }

    // 4. Credenciales válidas: generar JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
    })

    // 5. Responder con el token y datos del usuario (sin password)
    res.status(200).json({
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    })
  } catch (error) {
    console.error('Error en loginController:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
