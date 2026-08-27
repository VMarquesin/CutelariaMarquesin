import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import db from './db.js';

const router = express.Router();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. ROTA DE CADASTRO
router.post('/cadastro', async (req, res) => {
    const { username, email, senha } = req.body;
    try {
        if (!username || !email || !senha) {
            return res.status(400).json({ erro: 'Preencha todos os campos.' });
        }

        // Verifica se o e-mail já existe
        const [jaExiste] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (jaExiste.length > 0) {
            return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
        }

        // Criptografa a senha antes de salvar
        const hash = await bcrypt.hash(senha, 10);

        // NOME DA COLUNA CORRIGIDO PARA 'senha_hash' E VARIÁVEL PARA 'hash'
        await db.query(
            'INSERT INTO usuarios (username, email, senha_hash, role) VALUES (?, ?, ?, ?)', 
            [username, email, hash, 'usuario']
        );

        res.status(201).json({ mensagem: 'Sua conta na Forja & Fogo foi criada com sucesso!' });
    } catch (error) {
        console.error("[ERRO GRAVE NO CADASTRO]:", error);
        res.status(500).json({ erro: 'Erro interno ao criar conta.' });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        if (!email || !senha) {
            return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
        }

        const [results] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (results.length === 0) {
            return res.status(401).json({ erro: 'Usuário não encontrado' });
        }

        const usuario = results[0];
        
        // CORRIGIDO: Puxando exatamente o nome da coluna do banco (senha_hash)
        const hashBanco = usuario.senha_hash;

        if (!hashBanco) {
            return res.status(500).json({ erro: 'Falha na estrutura do banco de dados.' });
        }

        const senhaValida = await bcrypt.compare(senha, hashBanco);

        if (!senhaValida) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { id: usuario.id, role: usuario.role || 'usuario' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, usuario: { id: usuario.id, email: usuario.email } });
    } catch (error) {
        console.error("[ERRO GRAVE NO LOGIN]:", error);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

// 3. ESQUECI MINHA SENHA
router.post('/esqueci-senha', async (req, res) => {
    const { email } = req.body; 
    try {
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (usuarios.length === 0) return res.status(404).json({ erro: 'E-mail não cadastrado' });

        const usuario = usuarios[0];
        const token = uuidv4();
        
        const criadoEm = new Date();
        const expiraEm = new Date(criadoEm.getTime() + 30 * 60000);

        await db.query(
            'INSERT INTO reset_tokens (token, usuario_id, criado_em, expira_em) VALUES (?, ?, ?, ?)',
            [token, usuario.id, criadoEm, expiraEm]
        );

        const link = `${process.env.FRONTEND_URL}/resetar-senha?token=${token}`;

        await transporter.sendMail({
            from: '"Cutelaria Marquesin" <noreply@cutelaria.com>',
            to: usuario.email, 
            subject: 'Recuperação de Senha',
            html: `
                <h3>Olá, ${usuario.username}!</h3>
                <p>Você solicitou a recuperação de senha. Clique no link abaixo para criar uma nova senha:</p>
                <a href="${link}" style="padding: 10px 20px; background: #d97706; color: #fff; text-decoration: none; border-radius: 4px;">Redefinir Senha</a>
                <p><em>Este link expira em 30 minutos.</em></p>
            `
        });

        res.json({ mensagem: 'E-mail de recuperação enviado com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao gerar recuperação' });
    }
});

// 4. VALIDAR TOKEN E TROCAR SENHA
router.post('/resetar-senha', async (req, res) => {
    const { token, novaSenha } = req.body;
    try {
        const [tokens] = await db.query('SELECT * FROM reset_tokens WHERE token = ?', [token]);
        if (tokens.length === 0) return res.status(400).json({ erro: 'Token inválido' });

        const resetData = tokens[0];
        
        if (resetData.usado) return res.status(400).json({ erro: 'Este link já foi utilizado.' });
        if (new Date() > new Date(resetData.expira_em)) return res.status(400).json({ erro: 'Este link expirou.' });

        const hash = await bcrypt.hash(novaSenha, 10);
        
        // CORRIGIDO PARA 'senha_hash'
        await db.query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [hash, resetData.usuario_id]);
        await db.query('UPDATE reset_tokens SET usado = true WHERE token = ?', [token]);

        res.json({ mensagem: 'Senha alterada com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao alterar senha' });
    }
});

export default router;