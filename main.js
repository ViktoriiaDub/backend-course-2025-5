import { Command } from 'commander';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

//для визначення директорії
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//налаштування командного рядка
const program = new Command();
program
  .option('-h, --host <host>', 'адреса сервера', '127.0.0.1')
  .requiredOption('-p, --port <port>', 'порт сервера')
  .requiredOption('-c, --cache <cacheDir>', 'шлях до директорії для кешу');
program.parse(process.argv);

const { host, port, cache } = program.opts();

//директорія кешу
if (!fs.existsSync(cache)) {
  console.log(` Директорія "${cache}" не існує — створюю...`);
  fs.mkdirSync(cache, { recursive: true });
}


const server = http.createServer(async (req, res) => {
  const code = req.url.slice(1);
  const filePath = path.join(cache, `${code}.jpg`);

  try {
    if (req.method === 'GET') {
      try {
        const data = await fs.promises.readFile(filePath);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data);
      } catch {
        // Якщо файла немає → 404
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(' Not Found (404)');
      }
    }

    else if (req.method === 'PUT') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      await fs.promises.writeFile(filePath, buffer);
      res.writeHead(201, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(` Created`);
    }

    else if (req.method === 'DELETE') {
      try {
        await fs.promises.unlink(filePath);
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`OK`);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found (404)');
      }
    }

    else {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Method not allowed (405)');
    }
  } catch (err) {
    console.error('Помилка сервера:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(' Внутрішня помилка сервера (500)');
  }
});

//запуск
server.listen(port, host, () => {
  console.log(` Сервер запущено на http://${host}:${port}`);
  console.log(` Кеш директорія: ${path.resolve(cache)}`);
});
