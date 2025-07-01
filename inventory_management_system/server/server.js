import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = path.join(__dirname, 'db.json');

// Segéd függvény a JSON file olvasására.
function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Segéd függvény a JSON file írására.
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// 10 másodpercenként kiválaszt egy random tagot a JSON fájlból,
//  utána pedig szintén random eldönti, hogy csökkent vagy növeli a mennyiségét.
setInterval(() => {
  let inventory = readDB();
  let randomIndex = Math.floor(Math.random() * inventory.length);
  let randomItem = inventory[randomIndex];

  const change = Math.random() > 0.5 ? 1 : -1;
  randomItem.quantity += change;
  randomItem.lastUpdated = Date.now();

  if (randomItem.quantity < 0) {
    randomItem.quantity = 0;
  }

  writeDB(inventory);
  console.log(`Item '${randomItem.name}' quantity changed to ${randomItem.quantity}.`);

}, 10000)

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/api/inventory') {
    try {
      const inventory = readDB();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(inventory));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error: Could not read inventory data.');
    }
    return;
  }

  if (req.method === 'POST' && req.url.startsWith('/api/inventory/update')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { id, quantity, lastUpdated } = JSON.parse(body);

      let inventory = readDB();
      const itemIndex = inventory.findIndex(item => item.id === id);

      if (itemIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Item not found.');
        return;
      }
      
      const serverItem = inventory[itemIndex];   

      if (serverItem.lastUpdated > lastUpdated) {
        console.log(`Conflict detected for item ${id}: Client timestamp (${lastUpdated}) is older than server's (${serverItem.lastUpdated})`);
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(serverItem));
        return;
      }
      
      serverItem.quantity = quantity;
      serverItem.lastUpdated = Date.now();
      writeDB(inventory);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(serverItem));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(3000, () => {
  console.log(`Mock server is running at http://localhost:3000`);
});