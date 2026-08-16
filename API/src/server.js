import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swaggerDocs.js';
import referenciaRoutes from './routes/referenciaRoutes.js';

import authRoutes from './routes/authRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/auth', authRoutes);
app.use('/referencias', referenciaRoutes);

app.get('/ping', (req, res) => {
    res.json({ message: 'Servidor da Cutelaria rodando perfeitamente!' });
});

const PORT = process.env.PORT || 3000;

// app.use(express.static(path.join(__dirname, '../../frontend/dist')));
// app.get(/.*/, (req, res) => {
//     if (!req.path.startsWith('/auth') && !req.path.startsWith('/referencias') && !req.path.startsWith('/api-docs')) {
//         res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
//     }
// });

const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));
app.use((req, res, next) => {
    if (req.path.startsWith('/auth') || req.path.startsWith('/referencias') || req.path.startsWith('/api-docs')) {
        return res.status(404).json({ erro: "Rota da API não encontrada." });
    }
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`[API] Servidor da Cutelaria rodando na porta ${PORT}`);
    console.log(`[API] Documentação Swagger em http://localhost:${PORT}/api-docs`);
});