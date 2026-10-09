import express from 'express';
import axios from 'axios';
import http from 'http';

const router = express.Router();
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3002';

// Túnel para Webhook
router.post('/webhook', (req, res) => {
    const destUrl = new URL(`${PAYMENT_SERVICE_URL}/stripe/webhook`);

    const options = {
        hostname: destUrl.hostname,
        port: destUrl.port || 80,
        path: destUrl.pathname,
        method: 'POST',
        headers: { ...req.headers, host: destUrl.host },
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.status(proxyRes.statusCode);
        Object.entries(proxyRes.headers).forEach(([k, v]) => res.setHeader(k, v));
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error('[PROXY WEBHOOK ERROR]', err.message);
        res.status(502).json({ erro: 'Falha ao encaminhar webhook para o PaymentService.' });
    });

    req.pipe(proxyReq);
});

// Checkout proxy normal
router.use('/checkout', async (req, res) => {
    try {
        const respostaMicrosservico = await axios({
            method: req.method,
            url: `${PAYMENT_SERVICE_URL}/stripe/checkout`,
            data: req.body,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers['authorization'] || '',
                'x-forwarded-for': req.headers['x-forwarded-for'] || req.ip,
            },
        });

        res.status(respostaMicrosservico.status).json(respostaMicrosservico.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ erro: 'Microsserviço de pagamento está offline.' });
        }
    }
});

export default router;
