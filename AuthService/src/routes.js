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

// 1. CADASTRO (Agora aceita Username e Email)
router.post('/cadastro', async (req, res) => {
    const { username, email, senha } = req.body;
    try {
        const hash = await bcrypt.hash(senha, 10);
        await db.query(
            'INSERT INTO usuarios (username, email, senha, role) VALUES (?, ?, ?, ?)',
            [username, email, hash, 'usuario']
        );
        res.status(201).json({ mensagem: 'Usuário criado com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar usuário', detalhe: error.message });
    }
});

// 2. LOGIN (Procura pelo Email)
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ erro: 'E-mail não encontrado' });

        const usuario = rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta' });

        const token = jwt.sign(
            { id: usuario.id, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ token, role: usuario.role, username: usuario.username });
    } catch (error) {
        res.status(500).json({ erro: 'Erro no servidor' });
    }
});

// 3. ESQUECI MINHA SENHA (Busca pelo Email e envia para ele)
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

        // Agora o envio usa o e-mail real do usuário!
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

// 4. VALIDAR TOKEN E TROCAR SENHA (Permanece igual, pois usa o token)
router.post('/resetar-senha', async (req, res) => {
    const { token, novaSenha } = req.body;
    try {
        const [tokens] = await db.query('SELECT * FROM reset_tokens WHERE token = ?', [token]);
        if (tokens.length === 0) return res.status(400).json({ erro: 'Token inválido' });

        const resetData = tokens[0];
        
        if (resetData.usado) return res.status(400).json({ erro: 'Este link já foi utilizado.' });
        if (new Date() > new Date(resetData.expira_em)) return res.status(400).json({ erro: 'Este link expirou.' });

        const hash = await bcrypt.hash(novaSenha, 10);
        await db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [hash, resetData.usuario_id]);
        await db.query('UPDATE reset_tokens SET usado = true WHERE token = ?', [token]);

        res.json({ mensagem: 'Senha alterada com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao alterar senha' });
    }
});

export default router;