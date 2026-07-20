import pg from 'pg';

const { Pool } = pg;

const starterState = {
  products: [
    { id: 'p-arroz', name: 'Arroz 1 kg', category: 'Abarrotes', price: 4.8, stock: 25 },
    { id: 'p-azucar', name: 'Azucar 1 kg', category: 'Abarrotes', price: 4.2, stock: 18 },
    { id: 'p-aceite', name: 'Aceite 900 ml', category: 'Cocina', price: 8.9, stock: 12 },
    { id: 'p-jabon', name: 'Jabon de ropa', category: 'Limpieza', price: 3.5, stock: 20 }
  ],
  sales: []
};

let pool;
let initialized = false;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });
  }

  return pool;
}

async function initDb() {
  if (initialized) return;
  const db = getPool();
  await db.query(`
    create table if not exists app_state (
      id text primary key,
      data jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
  await db.query(
    `insert into app_state (id, data)
     values ($1, $2::jsonb)
     on conflict (id) do nothing`,
    ['tienda', JSON.stringify(starterState)]
  );
  initialized = true;
}

export default async function handler(req, res) {
  try {
    await initDb();

    if (req.method === 'GET') {
      const result = await getPool().query('select data from app_state where id = $1', ['tienda']);
      res.setHeader('cache-control', 'no-store');
      res.status(200).json(result.rows[0]?.data || starterState);
      return;
    }

    if (req.method === 'PUT') {
      await getPool().query(
        `insert into app_state (id, data, updated_at)
         values ($1, $2::jsonb, now())
         on conflict (id)
         do update set data = excluded.data, updated_at = now()`,
        ['tienda', JSON.stringify(req.body)]
      );
      res.setHeader('cache-control', 'no-store');
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('allow', 'GET, PUT');
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
}
