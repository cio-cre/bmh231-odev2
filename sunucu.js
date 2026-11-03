const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // İstek yöntemini ve yolunu uçbirime yaz
  console.log(`[${new Date().toLocaleTimeString()}] ${method} ${pathname}`);

  // GET Dışındaki Yöntemler (405)
  if (method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', 'Allow': 'GET' });
    return res.end('405 Method Not Allowed');
  }

  // API Uç Noktaları
  if (pathname === '/api/etkinlikler') {
    const tur = parsedUrl.searchParams.get('tur');
    fs.readFile(path.join(__dirname, 'etkinlikler.json'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ hata: 'Sunucu hatası' }));
      }
      let etkinlikler = JSON.parse(data);
      if (tur) {
        etkinlikler = etkinlikler.filter(e => e.tur === tur);
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(etkinlikler));
    });
    return;
  }

  // Tekil Etkinlik Getirme /api/etkinlikler/:id
  if (pathname.startsWith('/api/etkinlikler/')) {
    const idStr = pathname.split('/')[3];
    const id = parseInt(idStr, 10);

    fs.readFile(path.join(__dirname, 'etkinlikler.json'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ hata: 'Sunucu hatası' }));
      }
      const etkinlikler = JSON.parse(data);
      
      if (id === 999 || isNaN(id)) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ hata: "Etkinlik bulunamadı" }));
      }

      const etkinlik = etkinlikler.find(e => e.id === id);
      if (etkinlik) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(etkinlik));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ hata: "Etkinlik bulunamadı" }));
      }
    });
    return;
  }

  // Statik Dosya Sunumu (public klasörü dışına çıkışı engelleme koruması ile)
  let filePath = pathname === '/' ? 'public/index.html' : path.join('public', pathname);
  let extname = path.extname(filePath);
  
  // Güvenlik koruması: public dışı dosyalara erişimi engelle
  if (!filePath.startsWith('public')) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 Bulunamadı');
  }

  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
  };

  const contentType = mimeTypes[extname] || 'text/plain; charset=utf-8';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Sayfa Bulunamadı');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
});