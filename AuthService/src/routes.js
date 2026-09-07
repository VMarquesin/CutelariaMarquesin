import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import db from './db.js';

// AUDITORIA LOG-SERVICE
const registrarLog = async (usuario_id, acao, ip, detalhes) => {
    try {
        await fetch('http://log-service:3002/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id, acao, ip, detalhes })
        });
    } catch (error) {
        console.error('[AUDITORIA] Falha ao contatar LogService:', error.message);
    }
};

const router = express.Router();
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ROTA DE CADASTRO
router.post('/cadastro', async (req, res) => {
    const { username, email, senha } = req.body;
    try {
        if (!username || !email || !senha) {
            return res.status(400).json({ erro: 'Preencha todos os campos.' });
        }

        const [jaExiste] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (jaExiste.length > 0) {
            return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
        }

        const hash = await bcrypt.hash(senha, 10);

        await db.query(
            'INSERT INTO usuarios (username, email, senha_hash, role) VALUES (?, ?, ?, ?)', 
            [username, email, hash, 'usuario']
        );

        res.status(201).json({ mensagem: 'Sua conta na Forja & Fogo foi criada com sucesso!' });
    } 
    catch (error) 
    {
        console.error("[ERRO GRAVE NO CADASTRO]:", error);
        res.status(500).json({ erro: 'Erro interno ao criar conta.' });
    }
});

// LOGIN
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
        
        const ipUsuario = req.headers['x-forwarded-for'] || req.ip;
        registrarLog(usuario.id, 'LOGIN_SUCESSO', ipUsuario, 'Usuário entrou no sistema');

        res.json({ mensagem: 'Login bem-sucedido', token, usuario: { id: usuario.id, email: usuario.email } });
    } 
    catch (error) 
    {
        console.error("[ERRO GRAVE NO LOGIN]:", error);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

// ESQUECI MINHA SENHA
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
    } 
    catch (error) 
    {
        res.status(500).json({ erro: 'Erro ao gerar recuperação' });
    }
});

// VALIDAR TOKEN E TROCAR SENHA
router.post('/resetar-senha', async (req, res) => {
    const { token, novaSenha } = req.body;
    try {
        const [tokens] = await db.query('SELECT * FROM reset_tokens WHERE token = ?', [token]);
        if (tokens.length === 0) return res.status(400).json({ erro: 'Token inválido' });

        const resetData = tokens[0];
        
        if (resetData.usado) return res.status(400).json({ erro: 'Este link já foi utilizado.' });
        if (new Date() > new Date(resetData.expira_em)) return res.status(400).json({ erro: 'Este link expirou.' });

        const hash = await bcrypt.hash(novaSenha, 10);
        
        await db.query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [hash, resetData.usuario_id]);
        await db.query('UPDATE reset_tokens SET usado = true WHERE token = ?', [token]);

        res.json({ mensagem: 'Senha alterada com sucesso!' });
    } 
    catch (error) 
    {
        res.status(500).json({ erro: 'Erro ao alterar senha' });
    }
});

// MIDDLEWARE DE AUTORIZAÇÃO (RBAC)
const verificarAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const ipUsuario  = req.headers['x-forwarded-for'] || req.ip;
    
    if (!authHeader) {
        registrarLog('ANONIMO', 'TENTATIVA_ACESSO_SEM_TOKEN', ipUsuario, `Tentou acessar: ${req.originalUrl}`);
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1]; 
    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decodificado.role !== 'admin') {
            registrarLog(decodificado.id, 'TENTATIVA_ACESSO_ADMIN_NEGADO', 
                         ipUsuario, `Usuário comum tentou acessar rota restrita: ${req.originalUrl}`);
            return res.status(403).json({ erro: 'Acesso proibido (403).' });
        }

        req.usuarioLogado = decodificado;
        next(); 
    } 
    catch (error) 
    {
        registrarLog('ANONIMO', 'TENTATIVA_ACESSO_TOKEN_INVALIDO', ipUsuario, 'Token expirado ou forjado');
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
};

// ROTAS EXCLUSIVAS DE ADMIN
router.get('/admin/usuarios', verificarAdmin, async (req, res) => {
    try {
        const [usuarios] = await db.query(
            'SELECT id, username, email, role, criado_em FROM usuarios'
        );
        res.json(usuarios);
    } 
    catch (error) 
    {
        console.error("[ERRO AO LISTAR USUARIOS]:", error);
        res.status(500).json({ erro: 'Erro interno ao buscar usuários' });
    }
});

// PROMOVER OU REBAIXAR UM USUÁRIO (Protegido por verificarAdmin)
router.put('/admin/usuarios/:id/role', verificarAdmin, async (req, res) => {
    const { id } = req.params;
    const { novoRole } = req.body;

    if (novoRole !== 'admin' && novoRole !== 'usuario') {
        return res.status(400).json({ erro: 'Papel inválido. Use "admin" ou "usuario".' });
    }

    try {
        await db.query('UPDATE usuarios SET role = ? WHERE id = ?', [novoRole, id]);
        res.json({ mensagem: `O papel do usuário ${id} foi atualizado para '${novoRole}' com sucesso!` });
    } 
    catch (error) 
    {
        console.error("[ERRO AO ATUALIZAR PAPEL]:", error);
        res.status(500).json({ erro: 'Erro interno ao atualizar papel' });
    }
});

// ROTA DE LOGOUT (Auditoria)
router.post('/logout', (req, res) => { 
    const authHeader = req.headers.authorization;
    const ip = req.headers['x-forwarded-for'] || req.ip;
    
    if (!authHeader) {
        return res.status(200).json({ mensagem: 'Logout sem token (já deslogado)' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        registrarLog(decodificado.id, 'LOGOUT', ip, 'Usuário saiu do sistema');
    } catch (error) {
        // Se o token já expirou
    }
    
    res.json({ mensagem: 'Logout efetuado com sucesso' });
});
export default router;