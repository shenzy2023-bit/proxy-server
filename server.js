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
            
            // Eğer tarayıcıda kayıtlı bir çerez varsa, onu siteye gönderiyoruz
            // (Login'in devam etmesi için şart)
            return data;
        }
    ],

    // 2. CEVAPLAR (Siteden Bize Gelenler)
    responseMiddleware: [
        (data) => {
            // Sitenin "Beni burada açamazsın" korumalarını kaldır
            delete data.headers['x-frame-options'];
            delete data.headers['content-security-policy'];
            delete data.headers['content-security-policy-report-only'];
            delete data.headers['x-content-type-options'];

            // --- ÇEREZ DÜZELTME OPERASYONU ---
            // Siteden gelen "Set-Cookie" emirlerini yakalıyoruz
            const setCookie = data.headers['set-cookie'];
            if (setCookie) {
                // Çerezleri tek tek elden geçiriyoruz
                data.headers['set-cookie'] = setCookie.map(cookie => {
                    // 1. 'Domain=site.com' kısmını siliyoruz (Böylece bizim proxy'ye ait oluyor)
                    // 2. 'Secure' zorunluluğunu kaldırıyoruz (Bazen SSL çakışması yapar)
                    // 3. 'SameSite' kuralını gevşetiyoruz
                    return cookie
                        .replace(/Domain=[^;]+;/Zi, '') 
                        .replace(/Secure;/Zi, '')
                        .replace(/SameSite=[^;]+;/Zi, 'SameSite=Lax;');
                });
            }
            // ---------------------------------

            return data;
        }
    ]
});

// Büyük dosya/video indirmeleri için zaman aşımını kapat
app.use((req, res, next) => {
    req.socket.setTimeout(0); 
    next();
});

app.use(unblocker);

app.get('/', (req, res) => res.send('Cookie & Video Destekli Proxy Hazır!'));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Çalışıyor: Port ${port}`);
});
