const express = require('express');
const Unblocker = require('unblocker');
const app = express();

const unblocker = new Unblocker({
    prefix: '/proxy/',
    // 1. İSTEK KAMUFLAJI (Biz kimiz?)
    requestMiddleware: [
        (data) => {
            // Karşı siteye "Ben Windows 10 kullanan en güncel Chrome'um" diyoruz
            data.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
            
            // "Ben yönlendirildim" diyen ispiyoncu başlıkları siliyoruz
            delete data.headers['x-forwarded-for'];
            delete data.headers['via'];
            delete data.headers['forwarded'];
            
            return data;
        }
    ],
    // 2. CEVAP KAMUFLAJI (Site bize ne gönderdi?)
    responseMiddleware: [
        (data) => {
            // Sitenin "Beni sadece kendi adresimde açabilirsin" korumasını siliyoruz
            delete data.headers['x-frame-options'];
            delete data.headers['content-security-policy'];
            delete data.headers['x-content-type-options'];
            return data;
        }
    ]
});

app.use(unblocker);

app.get('/', (req, res) => res.send('Kamuflajlı Proxy Hazır!'));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Çalışıyor: Port ${port}`);
});
