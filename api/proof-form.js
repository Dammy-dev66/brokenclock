import { readFile } from 'node:fs/promises';
import path from 'node:path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.statusCode = 405;
    res.end('Method not allowed.');
    return;
  }

  const scriptPath = path.join(process.cwd(), 'public', 'proof-form.js');
  const script = await readFile(scriptPath, 'utf8');

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
  res.end(script);
}
