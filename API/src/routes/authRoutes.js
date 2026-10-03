import express from 'express';
import axios from 'axios';
import http from 'http';

const router = express.Router();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

router.post('/perfil/foto', (req, res) => {
    const destUrl = new URL(`${AUTH_SERVICE_URL}/auth/perfil/foto`);

    const options = {
        hostname: destUrl.hostname,
        port: destUrl.port || 80,
        path: destUrl.pathname,
        method: 'POST',
        headers: { ...req.headers, host: destUrl.host, },
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.status(proxyRes.statusCode);
        Object.entries(proxyRes.headers).forEach(([k, v]) => res.setHeader(k, v));
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error('[PROXY UPLOAD ERROR]', err.message);
        res.status(502).json({ erro: 'Falha ao encaminhar upload para o AuthService.' });
    });

    req.pipe(proxyReq);
});

router.get('/perfil/foto/:nomeArquivo', async (req, res) => {
    try {
        const response = await axios({
            method: 'get',
            url: `${AUTH_SERVICE_URL}/auth/perfil/foto/${encodeURIComponent(req.params.nomeArquivo)}`,
            responseType: 'stream',
        });

        res.status(response.status);
        Object.entries(response.headers).forEach(([k, v]) => res.setHeader(k, v));

        response.data.pipe(res);
    } catch (error) {
        if (!res.headersSent) {
            const status = error.response?.status || 502;
            res.status(status).json({ erro: 'Imagem não encontrada.' });
        }
    }
});


router.use(async (req, res) => {
    try {
        const respostaMicrosservico = await axios({
            method: req.method,
            url: `${AUTH_SERVICE_URL}/auth${req.path}`,
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
            res.status(500).json({ erro: 'Microsserviço de autenticação está offline.' });
        }
    }
});

export default router;