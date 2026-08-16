import pool from '../config/database.js';

class UsuarioRepository {
    async buscarPorUsername(username) {
        const [rows] = await pool.execute('SELECT * FROM usuarios WHERE username = ?', [username]);
        return rows[0];
    }

    async criar(username, senha_hash) {
        const [result] = await pool.execute(
            'INSERT INTO usuarios (username, senha_hash) VALUES (?, ?)',
            [username, senha_hash]
        );
        return result.insertId;
    }
}

export default new UsuarioRepository();