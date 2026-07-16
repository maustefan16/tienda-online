import pg from 'pg';

const { Pool } = pg;

const stateId = 'expedientes-policiales';

const starterState = {
  cases: [
    {
      id: 'demo-001',
      regDepinc: '001',
      htSgd: 'PNP-DEMO-2026',
      fecha: '2026-07-16',
      regionUnidad: 'DIRNIC-PNP / DIVINCRI / DEPINC',
      gradoPnp: 'GRADO PNP',
      apellidosNombres: 'Registro demostrativo',
      casoBanda: 'Expediente de ejemplo para validar busqueda y ficha.',
      propuesta: 'Accion distinguida',
      oficioUniasjur: '',
      informe: '',
      dictamen: '',
      observacionesDictamen: 'Registro demo',
      oficioDepincCios: '',
      oficioCiosDepinc: '',
      observacionesEstimar: 'No utilizar datos personales reales en este prototipo.',
      actaPronunciamiento: '',
      pronunciamiento: '',
      estado: 'En tramite',
      responsableTecnico: 'Sistema',
      createdAt: '2026-07-16T00:00:00.000Z',
      updatedAt: '2026-07-16T00:00:00.000Z',
      history: [{ date: '2026-07-16T00:00:00.000Z', action: 'Creacion de expediente demo', user: 'Sistema' }]
    }
  ]
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
    [stateId, JSON.stringify(starterState)]
  );
  initialized = true;
}

export default async function handler(req, res) {
  try {
    await initDb();

    if (req.method === 'GET') {
      const result = await getPool().query('select data from app_state where id = $1', [stateId]);
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
        [stateId, JSON.stringify(req.body)]
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
