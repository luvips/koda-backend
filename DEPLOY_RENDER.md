# Deployment en Render

## Configuración Rápida

### 1. Crear Web Service en Render

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub: `koda-backend`

### 2. Configuración del Service

**Build & Deploy:**
- **Name**: `koda-backend` (o el que prefieras)
- **Region**: Oregon (o el más cercano)
- **Branch**: `main`
- **Root Directory**: (dejar vacío)
- **Runtime**: `Node`
- **Build Command**: 
  ```
  npm install && npm run build
  ```
- **Start Command**: 
  ```
  npm start
  ```

### 3. Variables de Entorno

Agrega estas variables en la sección "Environment":

```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
JWT_SECRET=tu_secreto_jwt_seguro_aqui
FRONTEND_URL=https://koda-frontend-red.vercel.app
```

**IMPORTANTE**: 
- Usa la URL del **pooler de Supabase** (puerto 6543) para `DATABASE_URL`
- Usa la URL directa (puerto 5432) para `DIRECT_URL`
- Genera un JWT_SECRET seguro con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 

### 4. Plan

- **Instance Type**: Free (o el que prefieras)

### 5. Deploy

Click en "Create Web Service" y espera a que se despliegue (2-3 minutos).

## Verificación

Una vez desplegado, tu backend estará disponible en:
```
https://koda-backend-xxxx.onrender.com
```

Prueba el health check:
```
https://koda-backend-xxxx.onrender.com/api/v1/health
```

## Actualizar Frontend

No olvides actualizar la variable de entorno en el frontend (Vercel):
```
NEXT_PUBLIC_API_URL=https://koda-backend-xxxx.onrender.com
```

## Troubleshooting

### Error: Cannot find module 'dist/index.js'

Asegúrate de que el **Build Command** sea:
```
npm install && npm run build
```

### Error de conexión a BD

Verifica que:
1. `DATABASE_URL` use el pooler de Supabase (puerto 6543)
2. `DIRECT_URL` use la conexión directa (puerto 5432)
3. La contraseña sea correcta

### CORS Error

Verifica que `FRONTEND_URL` en Render coincida con la URL de tu frontend en Vercel.
