import pool from '../config/database.js';

class ReferenciaRepository {
    async salvar(usuarioId, unsplashId, urlImagem, comentario) {
        const [result] = await pool.execute(
            'INSERT INTO referencias_producao (usuario_id, unsplash_id, url_imagem, comentario) VALUES (?, ?, ?, ?)',
            [usuarioId, unsplashId, urlImagem, comentario]
        );
        return result.insertId;
    }

    async listarPorUsuario(usuarioId) {
        // A regra mais importante do trabalho: filtrar pelo ID do usuário logado!
        const [rows] = await pool.execute(
            'SELECT * FROM referencias_producao WHERE usuario_id = ? ORDER BY criado_em DESC',
            [usuarioId]
        );
        return rows;
    }
}

export default new ReferenciaRepository();