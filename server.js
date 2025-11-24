const express = require('express');
const Unblocker = require('unblocker');
const app = express();

const unblocker = new Unblocker({
    prefix: '/proxy/',
    // Videoların çalışması için bu ayarlar kritik:
    requestMiddleware: [
        (data) => {
            // Sadece User-Agent'ı değiştiriyoruz (Kamuflaj)
            // Diğer başlıklara (Range, Referer vb.) DOKUNMUYORUZ.
            data.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
            return data;
        }
    ],
    responseMiddleware: [
        (data) => {
            // Sitenin "Beni başka yerde açma" korumasını kaldırıyoruz
            delete data.headers['x-frame-options'];
            delete data.headers['content-security-policy'];
            delete data.headers['content-security-policy-report-only'];
            delete data.headers['x-content-type-options'];
            return data;
        }
    ]
});

// Büyük video dosyaları için limitleri kaldırıyoruz
app.use((req, res, next) => {
    req.socket.setTimeout(0); // Zaman aşımını engelle
    next();
});

app.use(unblocker);

app.get('/', (req, res) => res.send('Video Destekli Proxy Hazır!'));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Çalışıyor: Port ${port}`);
});
