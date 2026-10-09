import express from 'express';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import db from './db.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// MIDDLEWARE DE AUTENTICAÇÃO
const verificarUsuario = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });

    const token = authHeader.split(' ')[1];
    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioLogado = decodificado;
        next();
    } catch (error) {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
};

// ROTA: Inicializa a sessão de pagamento (Subscription)
router.post('/checkout', verificarUsuario, async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: process.env.PRICE_ID,
                    quantity: 1,
                },
            ],
            client_reference_id: String(req.usuarioLogado.id),
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pagamento-sucesso`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pagamento-cancelado`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('[STRIPE CHECKOUT ERROR]', error.message);
        res.status(500).json({ erro: 'Falha ao criar sessão de pagamento.' });
    }
});

// ROTA: Webhook cru para validação do Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('[STRIPE WEBHOOK ERROR]', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const usuarioId = session.client_reference_id;

        if (usuarioId) {
            try {
                await db.query('UPDATE usuarios SET is_premium = true WHERE id = ?', [usuarioId]);
            } catch (dbError) {
                console.error('[DB UPDATE ERROR]', dbError.message);
            }
        }
    }

    res.status(200).json({ received: true });
});

export default router;
