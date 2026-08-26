import express from 'express';
import axios from 'axios';

const router = express.Router();

// Como o container do catálogo e da auth estarão na mesma rede no Docker Compose,
// o Node consegue encontrar o outro serviço apenas pelo nome dele ("auth-service")
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

// Pega QUALQUER requisição que chegue em /auth/... e manda pro microsserviço
router.all('/*', async (req, res) => {
    try {
        const respostaMicrosservico = await axios({
            method: req.method,
            url: `${AUTH_SERVICE_URL}/auth${req.path}`,
            data: req.body,
            headers: { 'Content-Type': 'application/json' }
        });
        
        // Devolve pro React exatamente o que o microsserviço respondeu
        res.status(respostaMicrosservico.status).json(respostaMicrosservico.data);
    } catch (error) {
        if (error.response) {
            // Se o microsserviço devolveu erro 401 (senha errada), repassamos igual
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ erro: "Microsserviço de autenticação está offline." });
        }
    }
});

export default router;