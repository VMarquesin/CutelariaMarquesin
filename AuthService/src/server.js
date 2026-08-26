import express from 'express';
import cors from 'cors';
import authRoutes from './routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Todas as rotas entram em /auth
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`[AUTH-SERVICE] Microsserviço de autenticação rodando na porta ${PORT}`);
});