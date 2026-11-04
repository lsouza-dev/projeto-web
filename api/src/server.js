    import mySql from "./db/config.js"; // Trazendo conexão do banco
    import express from 'express';
    import dotenv from 'dotenv';
    import cors from 'cors';

    dotenv.config();

    // PORT recebe o valor do .env PORT OU 3333
    const PORT = process.env.PORT || 3333;

    // App recebendo o Express
    // Express é o que usamos para fazer a API com o Javascript
    const app = express(); 

    // Configuração de CORS
    app.use(cors());

    // Configuração para JSON nas requisições
    app.use(express.json());

    // Rota para listar as categorias
    app.get('/api/categorias', async (request,response) => {
        
        //  Busca das categorias no banco de dados
        const [categorias] = await mySql.query("SELECT * FROM categorias");

        // Retornando as categorias
        return response.json({
            categorias
        });
    });

    // Definindo a porta de excução da API e uma função ao iniciar
    app.listen( PORT , () => {
        console.log(`A API está rodando em http://localhost:${PORT}/api`)
        // console.log('A API está rodando em http://localhost:' + process.env.PORT + '/api')
    })