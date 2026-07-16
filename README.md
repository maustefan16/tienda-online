# Sistema de Expedientes Policiales

Aplicacion institucional para registrar, consultar y administrar expedientes documentales.

## Alcance actual

- Inicio de sesion de prototipo.
- Registro de expedientes.
- Busqueda por numero, nombres, DNI, dependencia, tipo, estado y ano.
- Ficha de detalle.
- Estadisticas basicas.
- Exportacion CSV.
- Persistencia en PostgreSQL/Supabase mediante `DATABASE_URL`.

## Importante

Esta version es un prototipo funcional. No ingresar datos reales sensibles hasta implementar autenticacion institucional, roles reales, auditoria completa y politicas de acceso.

## Archivos importantes

- `public/index.html`: interfaz principal.
- `server.mjs`: servidor web y API para ejecucion Node.
- `api/state.js`: API serverless para Vercel.
- `package.json`: dependencias y comando de inicio.
- `.env.example`: ejemplo de variable `DATABASE_URL`.

## Probar localmente

```bash
npm install
npm start
```

Sin `DATABASE_URL`, la app guarda datos en `expedientes-db.json` solo para pruebas locales.
