import express from 'express';
import cors from 'cors';
import paymentRoutes from './routes.js';

const app = express();
app.use(cors());

// Configuração condicional do express.json()
app.use((req, res, next) => {
    if (req.originalUrl === '/stripe/webhook') {
        return next(); // Pula o parser JSON no webhook
    }
    express.json()(req, res, next);
});

app.use('/stripe', paymentRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`[PAYMENT-SERVICE] Microsserviço de pagamento rodando na porta ${PORT}`);
});
