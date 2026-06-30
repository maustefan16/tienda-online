# Tienda Online

Esta version esta lista para subir a Render y guardar los datos en PostgreSQL/Supabase.

## Archivos importantes

- `public/index.html`: pantalla de la tienda.
- `server.mjs`: servidor web y API.
- `package.json`: dependencias y comando de inicio.
- `.env.example`: ejemplo de variable `DATABASE_URL`.

## Pasos

1. Crea una base PostgreSQL en Supabase.
2. Copia el connection string de Supabase en modo URI.
3. Sube esta carpeta a un repositorio de GitHub.
4. En Render, crea un `Web Service` desde ese repositorio.
5. Usa estos comandos:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. En Environment Variables agrega:
   - `DATABASE_URL`: el connection string de Supabase.

Cuando Render termine, la tienda quedara en un enlace fijo `onrender.com`.

## Probar localmente

```bash
npm install
npm start
```

Sin `DATABASE_URL`, la app guarda datos en `tienda-db.json` solo para pruebas locales.
