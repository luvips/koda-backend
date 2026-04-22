# Changelog

## Prompt 2 - Configuración de Prisma y Seed (2026-04-22)

### Schema de Prisma

Se definió el schema completo con 4 modelos principales:

#### User
- `id`: UUID generado por PostgreSQL
- `name`: Nombre del usuario (VARCHAR 100)
- `email`: Email único (VARCHAR 100)
- `password`: Hash bcrypt (VARCHAR 255)
- `createdAt`: Timestamp de creación
- Relación: `sessions` (uno a muchos con TypingSession)

#### Language
- `id`: UUID generado por PostgreSQL
- `name`: Nombre del lenguaje (VARCHAR 100, único)
- `slug`: Identificador URL-friendly (VARCHAR 100, único)
- `icon`: Emoji del lenguaje (VARCHAR 100, opcional)
- Relación: `snippets` (uno a muchos con Snippet)

#### Snippet
- `id`: UUID generado por PostgreSQL
- `languageId`: Referencia a Language
- `code`: Código fuente del snippet (TEXT)
- `difficulty`: Enum (EASY, MEDIUM, HARD)
- `specialCharacters`: Boolean (si tiene >15% de caracteres especiales)
- `tags`: Array de strings para categorización
- `source`: Origen del snippet (default: "seed")
- `sourceUrl`: URL opcional del origen
- `isActive`: Boolean para soft delete
- `createdAt`: Timestamp de creación
- Relaciones: `language` (muchos a uno), `sessions` (uno a muchos)

#### TypingSession
- `id`: UUID generado por PostgreSQL
- `userId`: Referencia a User
- `snippetId`: Referencia a Snippet
- `wpm`: Palabras por minuto (Float)
- `cpm`: Caracteres por minuto (Float)
- `precision`: Precisión en porcentaje (Float)
- `totalErrors`: Cantidad de errores (Int)
- `difficultKeys`: Array de teclas con más errores
- `status`: Enum (COMPLETED, INVALID, INCOMPLETE)
- `archived`: Boolean para archivar sesiones
- `date`: Timestamp de la sesión
- Relaciones: `user` (muchos a uno con CASCADE), `snippet` (muchos a uno)
- Índices: `[userId, date]`, `[snippetId]`, `[userId, status]`

### Enums

- **Difficulty**: EASY, MEDIUM, HARD
- **SessionStatus**: COMPLETED, INVALID, INCOMPLETE

### Script de Seed

Se implementó un seed completo e idempotente con:

#### Lenguajes (4)
- Python 🐍
- TypeScript 🔷
- JavaScript 🟨
- Java ☕

#### Snippets (12 con código real)

**Python (4):**
1. Función recursiva fibonacci con type hints
2. List comprehension con filter y lambda
3. Decorador @timer para medir tiempo de ejecución
4. Context manager con __enter__ y __exit__

**TypeScript (4):**
1. Interface genérica con constraints
2. async/await con manejo de errores tipado
3. Array methods encadenados (filter, map, reduce)
4. Type guard con keyword "is"

**JavaScript (2):**
1. Promise.all con destructuring
2. Closure con contador privado

**Java (2):**
1. ArrayList con forEach y lambda
2. For loop con ArrayList e índices

#### Usuario de Prueba
- Nombre: AWOS Tester
- Email: test@awos.dev
- Password: Test1234! (hasheado con bcrypt, 12 rounds)

#### Características del Seed
- **Idempotente**: Usa `upsert` para evitar duplicados
- **Cálculo automático de dificultad**: Basado en ratio de caracteres especiales
- **Código real**: Todos los snippets son ejemplos funcionales
- **Comentarios en español**: Explica cada paso del proceso

### Archivos Modificados

- `prisma/schema.prisma`: Schema completo con 4 modelos y 2 enums
- `prisma/seed.ts`: Seed completo con 12 snippets reales
- `README.md`: Actualizado con instrucciones de Supabase
- `.env.example`: Mejorado con instrucciones detalladas

### Archivos Nuevos

- `SETUP_SUPABASE.md`: Guía paso a paso para configurar Supabase
- `CHANGELOG.md`: Este archivo

### Comandos Importantes

```bash
# NO usar prisma migrate (las tablas ya existen)
npx prisma db pull      # Sincronizar schema desde BD existente
npx prisma generate     # Generar cliente TypeScript
npm run seed            # Poblar BD con datos iniciales
```

### Verificaciones

- ✅ Cliente Prisma generado correctamente
- ✅ TypeScript compila sin errores (strict mode)
- ✅ Linter pasa sin warnings
- ✅ Seed listo para ejecutar (requiere DATABASE_URL configurado)

### Próximos Pasos

- **Prompt 3**: Autenticación (register, login, middleware de JWT)
- **Prompt 4**: CRUD de snippets con filtros
- **Prompt 5**: Gestión de sesiones de tipeo
- **Prompt 6**: Endpoints de progreso y estadísticas

---

## Prompt 1 - Setup Inicial (2026-04-22)

- Configuración de TypeScript (strict mode)
- Express con middlewares de seguridad
- Cliente Prisma con patrón singleton
- Helpers JWT (sign/verify)
- Health check endpoint
- Estructura de carpetas completa
