import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../src/app'
import prisma from '../src/lib/prisma'

// Tests de autenticación
// Verifican el flujo completo de registro y login con validaciones

describe('Auth API', () => {
  // Email único para cada ejecución de tests (evita conflictos)
  const testEmail = `test-${Date.now()}@example.com`
  const testUser = {
    name: 'Test User',
    email: testEmail,
    password: 'Test1234!',
  }

  // Conectar a la BD antes de ejecutar los tests
  beforeAll(async () => {
    await prisma.$connect()
  })

  // Limpiar y desconectar después de los tests
  afterAll(async () => {
    // Eliminar el usuario de prueba si existe
    await prisma.user.deleteMany({
      where: { email: testEmail },
    })
    await prisma.$disconnect()
  })

  describe('POST /auth/register', () => {
    it('debe registrar un usuario con datos válidos', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(201)

      // Verificar estructura de la respuesta
      expect(response.body).toHaveProperty('message', 'User created')
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data.user).toHaveProperty('id')
      expect(response.body.data.user).toHaveProperty('email', testEmail)
      expect(response.body.data.user).toHaveProperty('name', testUser.name)

      // Verificar que NO se incluya el password en la respuesta
      expect(response.body.data.user).not.toHaveProperty('password')
    })

    it('debe rechazar email duplicado con 409', async () => {
      // Intentar registrar el mismo email otra vez
      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(409)

      expect(response.body).toHaveProperty('error', 'Email already registered')
    })

    it('debe rechazar password sin mayúscula con 400', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'another@example.com',
          password: 'test1234', // Sin mayúscula
        })
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Validation failed')
      expect(response.body.details).toHaveProperty('password')
      expect(response.body.details.password).toContain(
        'La contraseña debe incluir al menos una mayúscula'
      )
    })

    it('debe rechazar email inválido con 400', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'not-an-email', // Email inválido
          password: 'Test1234!',
        })
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Validation failed')
      expect(response.body.details).toHaveProperty('email')
    })

    it('debe rechazar password sin número con 400', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPassword', // Sin número
        })
        .expect(400)

      expect(response.body.details.password).toContain(
        'La contraseña debe incluir al menos un número'
      )
    })
  })

  describe('POST /auth/login', () => {
    it('debe autenticar con credenciales correctas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testUser.password,
        })
        .expect(200)

      // Verificar que retorna token y datos del usuario
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data.user).toHaveProperty('id')
      expect(response.body.data.user).toHaveProperty('email', testEmail)

      // Verificar que NO se incluya el password
      expect(response.body.data.user).not.toHaveProperty('password')
    })

    it('debe rechazar password incorrecta con 401', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401)

      expect(response.body).toHaveProperty('error', 'Invalid credentials')
    })

    it('debe rechazar email no registrado con 401', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'noexiste@example.com',
          password: 'Test1234!',
        })
        .expect(401)

      // Mismo mensaje que password incorrecta (seguridad)
      expect(response.body).toHaveProperty('error', 'Invalid credentials')
    })

    it('debe rechazar email con formato inválido', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'not-an-email',
          password: 'Test1234!',
        })
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Validation failed')
    })
  })
})
