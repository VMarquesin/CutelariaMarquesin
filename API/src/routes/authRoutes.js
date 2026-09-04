import express from 'express';
import axios from 'axios';

const router = express.Router();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

router.use(async (req, res) => {
    try {
        const respostaMicrosservico = await axios({
            method: req.method,
            url: `${AUTH_SERVICE_URL}/auth${req.path}`,
            data: req.body,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': req.headers['authorization'] || '' 
            }
        });
        
        res.status(respostaMicrosservico.status).json(respostaMicrosservico.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ erro: "Microsserviço de autenticação está offline." });
        }
    }
});

export default router;