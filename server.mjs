import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(__dirname, 'public');
const localDbPath = join(__dirname, 'tienda-db.json');
const port = Number(process.env.PORT || 8080);
const databaseUrl = process.env.DATABASE_URL;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const starterState = {
  products: [
    { id: 'p-arroz', name: 'Arroz 1 kg', category: 'Abarrotes', price: 4.8, stock: 25 },
    { id: 'p-azucar', name: 'Azucar 1 kg', category: 'Abarrotes', price: 4.2, stock: 18 },
    { id: 'p-aceite', name: 'Aceite 900 ml', category: 'Cocina', price: 8.9, stock: 12 },
    { id: 'p-jabon', name: 'Jabon de ropa', category: 'Limpieza', price: 3.5, stock: 20 }
  ],
  sales: []
};

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false }
    })
  : null;

async function initDb() {
  if (!pool) return;
  await pool.query(`
    create table if not exists app_state (
      id text primary key,
      data jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
  await pool.query(
    `insert into app_state (id, data)
     values ($1, $2::jsonb)
     on conflict (id) do nothing`,
    ['tienda', JSON.stringify(starterState)]
  );
}

async function readDb() {
  if (pool) {
    const result = await pool.query('select data from app_state where id = $1', ['tienda']);
    return result.rows[0]?.data || starterState;
  }

  try {
    return JSON.parse(await readFile(localDbPath, 'utf8'));
  } catch {
    await writeDb(starterState);
    return starterState;
  }
}

async function writeDb(state) {
  if (pool) {
    await pool.query(
      `insert into app_state (id, data, updated_at)
       values ($1, $2::jsonb, now())
       on conflict (id)
       do update set data = excluded.data, updated_at = now()`,
      ['tienda', JSON.stringify(state)]
    );
    return;
  }

  await writeFile(localDbPath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://localhost:${port}`);

    if (url.pathname === '/api/health') {
      sendJson(res, 200, { ok: true, database: Boolean(pool) });
      return;
    }

    if (url.pathname === '/api/state' && req.method === 'GET') {
      sendJson(res, 200, await readDb());
      return;
    }

    if (url.pathname === '/api/state' && req.method === 'PUT') {
      const state = await readJsonBody(req);
      await writeDb(state);
      sendJson(res, 200, { ok: true });
      return;
    }

    const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const filePath = normalize(join(publicDir, requested));

    if (!filePath.startsWith(normalize(publicDir))) {
      res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    const body = await readFile(filePath);
    res.writeHead(200, { 'content-type': types[extname(filePath)] || 'application/octet-stream' });
    res.end(body);
  } catch (error) {
    const status = error.code === 'ENOENT' ? 404 : 500;
    res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(status === 404 ? 'Not found' : 'Server error');
  }
});

await initDb();

server.listen(port, '0.0.0.0', () => {
  console.log(`Tienda online escuchando en puerto ${port}`);
});
