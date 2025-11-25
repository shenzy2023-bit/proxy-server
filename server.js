const express = require('express');
const Unblocker = require('unblocker');
const app = express();

const unblocker = new Unblocker({
    prefix: '/proxy/',
    
    // 1. İSTEKLER (Bizden Siteye Gidenler)
    requestMiddleware: [
        (data) => {
            // Siteye "Ben Chrome'um" diyoruz
            data.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
            return data;
        }
    ],

    // 2. CEVAPLAR (Siteden Bize Gelenler)
    responseMiddleware: [
        (data) => {
            // Güvenlik başlıklarını temizle
            delete data.headers['x-frame-options'];
            delete data.headers['content-security-policy'];
            delete data.headers['content-security-policy-report-only'];
            delete data.headers['x-content-type-options'];

            // --- ÇEREZ DÜZELTME (HATA BURADAYDI, DÜZELDİ) ---
            const setCookie = data.headers['set-cookie'];
            if (setCookie) {
                data.headers['set-cookie'] = setCookie.map(cookie => {
                    return cookie
                        .replace(/Domain=[^;]+;/gi, '') // 'Z' harfi 'g' ile değiştirildi
                        .replace(/Secure;/gi, '')      // 'Z' harfi 'g' ile değiştirildi
                        .replace(/SameSite=[^;]+;/gi, 'SameSite=Lax;'); // 'Z' harfi 'g' ile değiştirildi
                });
            }
            // ---------------------------------

            return data;
        }
    ]
});

// Zaman aşımını engelle
app.use((req, res, next) => {
    req.socket.setTimeout(0); 
    next();
});

app.use(unblocker);

app.get('/', (req, res) => res.send('Cookie & Video Proxy (Düzeltildi) Hazır!'));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Çalışıyor: Port ${port}`);
});
