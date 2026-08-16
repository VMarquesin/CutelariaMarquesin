import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verificarToken = (req, res, next) => {
    // Pega o token do cabeçalho da requisição (padrão Bearer Token)
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido. Acesso negado.' });
    }

    const token = authHeader.split(' ')[1]; // Separa a palavra "Bearer" do token em si

    try {
        // Tenta decodificar o token com a nossa chave secreta
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // Injeta o ID do usuário na requisição para os próximos passos usarem
        req.usuarioId = decodificado.id;
        
        next(); // Tudo certo, pode seguir para o Controller!
    } catch (erro) {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
};