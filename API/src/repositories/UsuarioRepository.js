import pool from '../config/database.js';

class UsuarioRepository {
    async buscarPorUsername(username) {
        // Busca o usuário pelo nome. O [rows] tira o resultado de dentro do array que o mysql2 devolve
        const [rows] = await pool.execute('SELECT * FROM usuarios WHERE username = ?', [username]);
        return rows[0]; // Retorna o usuário ou undefined se não achar
    }

    async criar(username, senha_hash) {
        const [result] = await pool.execute(
            'INSERT INTO usuarios (username, senha_hash) VALUES (?, ?)',
            [username, senha_hash]
        );
        return result.insertId; // Retorna o ID do novo usuário criado
    }
}

export default new UsuarioRepository();