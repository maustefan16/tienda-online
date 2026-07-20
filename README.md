# Tienda Online

Esta version esta lista para subir a Vercel o Render y guardar los datos en PostgreSQL/Supabase.

## Archivos importantes

- `public/index.html`: pantalla de la tienda.
- `server.mjs`: servidor web y API.
- `api/state.js`: API serverless para Vercel.
- `package.json`: dependencias y comando de inicio.
- `.env.example`: ejemplo de variable `DATABASE_URL`.

## Opcion gratis sin laptop: Vercel + Supabase

1. Crea una base PostgreSQL en Supabase.
2. Copia el connection string de Supabase en modo URI.
3. Sube esta carpeta a un repositorio de GitHub.
4. En Vercel, importa el repositorio.
5. En Environment Variables agrega:
   - `DATABASE_URL`: el connection string de Supabase.
6. Deploy.

## Opcion Render

En Render, crea un `Web Service` desde el repositorio y usa estos comandos:
   - Build Command: `npm install`
   - Start Command: `npm start`
Agrega la variable:
   - `DATABASE_URL`: el connection string de Supabase.

Cuando termine, la tienda quedara en un enlace fijo.

## Probar localmente

```bash
npm install
npm start
```

Sin `DATABASE_URL`, la app guarda datos en `tienda-db.json` solo para pruebas locales.
