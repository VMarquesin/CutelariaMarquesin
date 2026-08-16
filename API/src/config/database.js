import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then((connection) => {
        console.log('Conectado ao banco de dados MySQL com sucesso!');
        connection.release(); // Libera a conexão de volta pra pool
    })
    .catch((err) => {
        console.error('ERROR: Não foi possível conectar ao banco de dados!');
        console.error('Motivo:', err.message);
    });

export default pool;