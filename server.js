const express = require('express');
const Unblocker = require('unblocker');
const app = express();

// Unblocker ayarlarý
const unblocker = new Unblocker({
    prefix: '/proxy/',
    responseMiddleware: [
        // Bazý sitelerdeki güvenlik baþlýklarýný temizle (daha rahat giriþ için)
        (data) => {
            delete data.headers['x-frame-options'];
            delete data.headers['content-security-policy'];
            return data;
        }
    ]
});

// Proxy'yi kullan
app.use(unblocker);

app.get('/', (req, res) => res.send('Proxy Sunucusu Aktif!'));

// Render.com için Port ayarý (ÖNEMLÝ)
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Çalýþýyor: Port ${port}`);
});