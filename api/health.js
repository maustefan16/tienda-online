export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    database: Boolean(process.env.DATABASE_URL)
  });
}
