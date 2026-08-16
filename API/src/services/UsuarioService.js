import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import usuarioRepository from '../repositories/UsuarioRepository.js';

class UsuarioService {
    async cadastrar(username, senha) {
        const usuarioExiste = await usuarioRepository.buscarPorUsername(username);
        if (usuarioExiste) {
            throw new Error('Esse usuário já está cadastrado.');
        }

        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(senha, salt);
        const id = await usuarioRepository.criar(username, senha_hash);
        return id;
    }

    async login(username, senha) {
        const usuario = await usuarioRepository.buscarPorUsername(username);
        if (!usuario) {
            throw new Error('Usuário ou senha inválidos.');
        }

        const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaConfere) {
            throw new Error('Usuário ou senha inválidos.');
        }

        const token = jwt.sign(
            { id: usuario.id, username: usuario.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        return { token, id: usuario.id, username: usuario.username };
    }
}

export default new UsuarioService();