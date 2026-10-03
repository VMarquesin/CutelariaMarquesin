import express from 'express';
import axios from 'axios';
import http from 'http';

const router = express.Router();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

// ─────────────────────────────────────────────────────────────────────────────
// ROTA ESPECIAL: Upload de foto de perfil
// Usa pipe nativo HTTP para preservar o stream multipart/form-data intocado.
// O axios destruiria o boundary ao reserializar o body.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/perfil/foto', (req, res) => {
    const destUrl = new URL(`${AUTH_SERVICE_URL}/auth/perfil/foto`);

    const options = {
        hostname: destUrl.hostname,
        port: destUrl.port || 80,
        path: destUrl.pathname,
        method: 'POST',
        headers: {
            // Repassa TODOS os headers originais (incluindo Content-Type com o
            // boundary correto e o Authorization com JWT)
            ...req.headers,
            host: destUrl.host,
        },
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

    // Faz o pipe do stream de upload direto para o AuthService — sem buffer
    req.pipe(proxyReq);
});

// ─────────────────────────────────────────────────────────────────────────────
// PROXY GERAL: Todas as outras rotas /auth usam axios (JSON)
// ─────────────────────────────────────────────────────────────────────────────
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