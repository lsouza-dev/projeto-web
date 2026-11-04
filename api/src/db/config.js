import mysql from 'mysql2/promise'; // Importando o pacote mysql que foi instalado com npm install mysql2

import dotenv from 'dotenv';
//Importando o pacote dotenv que foi instalado com npm install dotenv

// Buscando os valores de .env
dotenv.config();

// Criando a conexão com o banco de dados
const mySql = await mysql.createConnection({
    host: process.env.DB_HOST, // Host do banco
    user: process.env.DB_USER, // Usuário
    password: process.env.DB_PASSWORD, // Senha
    database: process.env.DB_NAME, // Nome do banco criado
    waitForConnections: true // Aguarda por conexão
})

// Exportando a conexão com o banco
export default mySql;