import express from 'express';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// Conexão com o Redis
const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.on('error', (err) => console.error('Erro no Redis:', err));
await redisClient.connect();
const STREAM_KEY = 'auditoria_stream';

// GRAVAR LOG (Uso interno dos microsserviços)
// ==========================================
// ROTA 1: GRAVAR LOG (Uso interno)
// ==========================================
app.post('/log', async (req, res) => {
    const { usuario_id, acao, ip, detalhes } = req.body;
    
    if (!usuario_id || !acao) {
        return res.status(400).json({ erro: 'Faltam dados para o log' });
    }

    try {
        const timestampFormatado = new Date().toISOString();
        
        await redisClient.xAdd(STREAM_KEY, '*', {
            usuario_id: String(usuario_id),
            acao: String(acao),
            ip: String(ip || 'Desconhecido'),
            detalhes: String(detalhes || 'Sem detalhes adicionais'),
            data_hora: timestampFormatado
        });
        
        console.log(`[LOG REGISTRADO] Usuário: ${usuario_id} | Ação: ${acao}`);
        res.status(201).send('Log registrado com sucesso');
    } catch (error) {
        console.error('Erro ao gravar log no Redis:', error);
        res.status(500).send('Erro interno');
    }
});

// CONSULTAR LOGS (Exclusivo para ADMIN)
app.get('/logs', async (req, res) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ erro: 'Token ausente' });

    const token = authHeader.split(' ')[1];
    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decodificado.role !== 'admin') {
            const ipInvasor = req.headers['x-forwarded-for'] || req.ip || 'Desconhecido';
            
            await redisClient.xAdd(STREAM_KEY, '*', {
                usuario_id: String(decodificado.id),
                acao: 'TENTATIVA_ACESSO_NEGADO_LOGS',
                ip: String(ipInvasor),
                detalhes: 'Tentativa de visualizar aba de auditoria bloqueada',
                data_hora: new Date().toISOString()
            });
            return res.status(403).json({ erro: 'Acesso proibido. Apenas administradores.' });
        }
        
        const logsRaw = await redisClient.xRevRange(STREAM_KEY, '+', '-', 'COUNT', 50);
        const logsFormatados = logsRaw.map(log => ({
            redis_id: log.id,
            usuario_id: log.message.usuario_id,
            acao: log.message.acao,
            ip: log.message.ip || 'Desconhecido',
            detalhes: log.message.detalhes || 'Sem detalhes adicionais',
            data_hora: log.message.data_hora
        }));

        res.json(logsFormatados);
    } 
    catch (error) 
    {
        return res.status(401).json({ erro: 'Token inválido' });
    }
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`[LOG-SERVICE] Rodando na porta ${PORT} e conectado ao Redis!`);
});