# Configuración de Supabase para AWOS Backend

Este documento explica cómo conectar el backend con tu base de datos PostgreSQL en Supabase.

## Paso 1: Obtener la URL de Conexión

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Settings** (⚙️) → **Database**
4. En la sección **Connection String**, selecciona **URI**
5. Copia la URL completa

La URL tendrá este formato:
```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

## Paso 2: Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Abre `.env` y pega tu URL de Supabase:
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:TU_PASSWORD_REAL@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
   ```

   **IMPORTANTE**: Reemplaza `[YOUR-PASSWORD]` con tu contraseña real de Supabase.

3. Genera un secreto JWT seguro:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
   Copia el resultado y pégalo en `JWT_SECRET`:
   ```env
   JWT_SECRET="el_hash_generado_aqui"
   ```

## Paso 3: Verificar las Tablas

Las tablas ya deben existir en tu base de datos Supabase. Verifica que existan estas tablas:

- `User`
- `Language`
- `Snippet`
- `TypingSession`

Si las tablas NO existen, ejecuta el SQL del archivo `koda-bd/01_schema.sql` en el SQL Editor de Supabase.

## Paso 4: Sincronizar Prisma (Opcional)

Si quieres que Prisma sincronice su schema con las tablas existentes:

```bash
npx prisma db pull
```

Esto actualizará `prisma/schema.prisma` con la estructura real de tu BD.

Luego regenera el cliente:

```bash
npx prisma generate
```

## Paso 5: Poblar la Base de Datos

Ejecuta el seed para crear datos iniciales:

```bash
npm run seed
```

Esto creará:
- 4 lenguajes (Python, TypeScript, JavaScript, Java)
- 12 snippets de código real
- 1 usuario de prueba:
  - Email: `test@awos.dev`
  - Password: `Test1234!`

El seed es **idempotente**: puedes ejecutarlo múltiples veces sin duplicar datos.

## Paso 6: Iniciar el Servidor

```bash
npm run dev
```

Deberías ver:
```
Base de datos conectada
Servidor en puerto 4000
Entorno: development
```

## Verificación

Prueba el health check:

```bash
curl http://localhost:4000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "db": "connected",
  "version": "1.0.0",
  "uptime": 5.123,
  "environment": "development"
}
```

Si `db: "connected"`, todo está funcionando correctamente.

## Troubleshooting

### Error: "Authentication failed"

- Verifica que la contraseña en `DATABASE_URL` sea correcta
- Asegúrate de no tener espacios extra al copiar la URL
- Verifica que tu IP esté permitida en Supabase (Settings → Database → Connection Pooling)

### Error: "relation does not exist"

- Las tablas no existen en la BD
- Ejecuta el SQL de `koda-bd/01_schema.sql` en Supabase SQL Editor

### Error: "Unique constraint failed"

- Ya ejecutaste el seed antes
- Esto es normal, el seed es idempotente y no duplicará datos

## Próximos Pasos

Una vez configurado Supabase y ejecutado el seed, puedes continuar con:

- **Prompt 3**: Implementar autenticación (register, login)
- **Prompt 4**: CRUD de snippets
- **Prompt 5**: Gestión de sesiones de tipeo
- **Prompt 6**: Endpoints de progreso y estadísticas
