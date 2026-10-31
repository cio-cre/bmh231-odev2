const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Her isteğin yöntemini ve yolunu uçbirime (terminale) yazdır
    console.log(`[${new Date().toISOString()}] ${method} ${req.url}`);

    // GET dışındaki yöntemler için 405 Method Not Allowed ve Allow başlığı
    if (method !== 'GET') {
        res.writeHead(405, { 
            'Allow': 'GET', 
            'Content-Type': 'text/plain; charset=utf-8' 
        });
        res.end('405 Method Not Allowed');
        return;
    }

    // API Uç Noktaları (/api/etkinlikler)
    if (pathname.startsWith('/api/etkinlikler')) {
        const filePath = path.join(__dirname, 'etkinlikler.json');
        
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ hata: 'Sunucu veri okuma hatası' }));
                return;
            }

            let etkinlikler = JSON.parse(data);
            const pathParts = pathname.split('/').filter(Boolean); // ['api', 'etkinlikler', '3'] vb.

            // GET /api/etkinlikler/:id (Örn: /api/etkinlikler/3)
            if (pathParts.length === 3) {
                const id = parseInt(pathParts[2], 10);
                const etkinlik = etkinlikler.find(e => e.id === id);
                if (etkinlik) {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(etkinlik));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ hata: "Etkinlik bulunamadı" }));
                }
                return;
            }

            // GET /api/etkinlikler?tur=atolye (Sorgu dizesi filtrelemesi)
            const turParam = parsedUrl.searchParams.get('tur');
            if (turParam) {
                etkinlikler = etkinlikler.filter(e => e.tur === turParam);
            }

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(etkinlikler));
        });
        return;
    }

    // Statik Dosya Sunumu (public klasörü)
    let filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, pathname);
    
    // Güvenlik Kuralı: public klasörü dışındaki dosyaların (örn. sunucu.js) istenmesini engelle
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Sayfa Bulunamadı');
            return;
        }

        const ext = path.extname(filePath);
        let contentType = 'text/plain; charset=utf-8';
        if (ext === '.html') contentType = 'text/html; charset=utf-8';
        else if (ext === '.css') contentType = 'text/css; charset=utf-8';
        else if (ext === '.js') contentType = 'text/javascript; charset=utf-8';
        else if (ext === '.json') contentType = 'application/json; charset=utf-8';

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
});