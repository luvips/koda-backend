# KODA Backend

Backend API para AWOS - typing speed trainer para programadores.

## Stack Tecnológico

- **Runtime**: Node.js 20 LTS
- **Framework**: Express 4 + TypeScript (strict mode)
- **ORM**: Prisma 5 con PostgreSQL (Supabase)
- **Validación**: Zod
- **Autenticación**: jsonwebtoken + bcryptjs
- **Seguridad**: helmet, cors, express-rate-limit
- **Testing**: Vitest + supertest
- **Dev Tools**: tsx (hot reload)

## Estructura del Proyecto

```
src/
├── index.ts              # Entry point - inicialización del servidor
├── app.ts                # Configuración de Express (middlewares y rutas)
├── routes/               # Definición de endpoints
│   ├── health.routes.ts  # ✅ Health check
│   ├── auth.routes.ts    # TODO: Prompt 3
│   ├── snippets.routes.ts # TODO: Prompt 4
│   ├── sessions.routes.ts # TODO: Prompt 5
│   └── progress.routes.ts # TODO: Prompt 6
├── controllers/          # TODO: Prompts 3-6
├── services/             # TODO: Prompts 4-6
├── middleware/           # TODO: Prompt 3
├── validators/           # TODO: Prompts 3-5
├── types/
│   └── index.ts          # ✅ Interfaces y tipos compartidos
└── lib/
    ├── prisma.ts         # ✅ Cliente Prisma (singleton)
    └── jwt.ts            # ✅ Helpers para JWT
```

## Scripts Disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Compilar TypeScript a JavaScript
npm run build

# Ejecutar en producción
npm start

# Verificar tipos sin compilar
npm run type-check

# Linter
npm run lint

# Tests
npm test              # Ejecutar una vez
npm run test:watch    # Modo watch

# Prisma
npm run seed          # Poblar BD con datos iniciales
```

## Configuración

### 1. Variables de Entorno

Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

Configura las variables de entorno:
- `DATABASE_URL`: URL de conexión a PostgreSQL de Supabase
- `JWT_SECRET`: Secreto para firmar tokens (usa algo seguro en producción)
- `FRONTEND_URL`: URL del frontend para CORS
- `PORT`: Puerto del servidor (default: 4000)

### 2. Configuración de Supabase

Para obtener la `DATABASE_URL` de Supabase:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Settings → Database → Connection String → URI
3. Copia la URL y reemplaza `[YOUR-PASSWORD]` con tu contraseña real
4. Pégala en `.env` como `DATABASE_URL`

Ejemplo:
```
DATABASE_URL="postgresql://postgres.xxxxx:tu_password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

### 3. Sincronizar Schema (IMPORTANTE)

Las tablas ya existen en Supabase. NO uses `prisma migrate`. En su lugar:

```bash
# Sincronizar el schema de Prisma con la BD existente
npx prisma db pull

# Generar el cliente TypeScript
npx prisma generate
```

### 4. Poblar la Base de Datos

Ejecuta el seed para crear datos iniciales (lenguajes, snippets, usuario de prueba):

```bash
npm run seed
```

El seed es idempotente: puedes ejecutarlo múltiples veces sin duplicar datos.

## Verificación

Para verificar que todo funciona:

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm run dev

# En otra terminal, probar el health check
curl http://localhost:4000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "db": "connected",
  "version": "1.0.0",
  "uptime": 1.234,
  "environment": "development"
}
```

## Estado Actual

### ✅ Completado (Prompts 1-2)
- Setup inicial del proyecto
- Configuración de TypeScript (strict mode)
- Express con middlewares de seguridad (helmet, cors)
- Cliente Prisma con patrón singleton
- Helpers JWT (sign/verify)
- Health check endpoint
- Estructura de carpetas completa
- **Schema completo de Prisma** (User, Language, Snippet, TypingSession)
- **Seed con datos reales** (4 lenguajes, 12 snippets, usuario de prueba)

### 🔜 Pendiente
- **Prompt 3**: Autenticación (register, login, middleware)
- **Prompt 4**: CRUD de snippets
- **Prompt 5**: Gestión de sesiones de tipeo
- **Prompt 6**: Endpoints de progreso y estadísticas

## Notas de Arquitectura

### Orden de Middlewares
El orden de los middlewares en `app.ts` es crítico:
1. `helmet()` - Headers de seguridad
2. `cors()` - Configuración CORS
3. `express.json()` - Parseo de JSON
4. `express.urlencoded()` - Parseo de formularios
5. Logger personalizado
6. Rutas
7. Handler 404
8. Handler de errores global

### Patrón Singleton en Prisma
`src/lib/prisma.ts` usa un singleton para evitar múltiples conexiones en desarrollo con hot reload (tsx). En producción crea una instancia nueva directamente.

### Manejo de Errores
- Errores no manejados se capturan en el error handler global
- En desarrollo se expone el stack trace
- En producción se oculta para no filtrar información sensible

### Cierre Limpio
El servidor escucha `SIGTERM` y `SIGINT` para cerrar la conexión a BD antes de terminar el proceso.
