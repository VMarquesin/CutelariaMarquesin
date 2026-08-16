import usuarioService from '../services/UsuarioService.js';

class UsuarioController {
    async cadastrar(req, res) {
        try {
            const { username, senha } = req.body;
            
            if (!username || !senha) {
                return res.status(400).json({ erro: 'Username e senha são obrigatórios.' });
            }

            const novoId = await usuarioService.cadastrar(username, senha);
            res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', id: novoId });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async login(req, res) {
        try {
            const { username, senha } = req.body;
            
            if (!username || !senha) {
                return res.status(400).json({ erro: 'Username e senha são obrigatórios.' });
            }

            const dadosLogin = await usuarioService.login(username, senha);
            res.json(dadosLogin);
        } catch (erro) {
            res.status(401).json({ erro: erro.message });
        }
    }
}

export default new UsuarioController();