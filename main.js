import { Command } from 'commander';
import http from 'http';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера', parseInt)
  .requiredOption('-c, --cache <path>', 'шлях до директорії кешу');

program.parse(process.argv);

const { host, port, cache } = program.opts();

// створення директорії кешу, якщо її немає
if (!fs.existsSync(cache)) {
  fs.mkdirSync(cache, { recursive: true });
  console.log(`Директорію ${cache} створено.`);
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Проксі-сервер працює!');
});

server.listen(port, host, () => {
  console.log(`Сервер запущено на http://${host}:${port}`);
});
