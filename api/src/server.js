    import mySql from "./db/config.js"; // Trazendo conexão do banco
    import express from 'express';
    import dotenv from 'dotenv';
    import cors from 'cors';
    import categoriasRoutes from "./routes/categoriasRoutes.js";
import produtoRouter from "./routes/produtosRoutes.js";
import usuarioRouter from "./routes/usuariosRoutes.js";
import lojasRouter from "./routes/lojasRoutes.js";

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

    app.use('/api/categorias',categoriasRoutes)

    app.use('/api/produtos',produtoRouter);

    app.use('/api/usuarios', usuarioRouter)

    app.use('/api/lojas', lojasRouter)

    // Definindo a porta de excução da API e uma função ao iniciar
    app.listen( PORT , () => {
        console.log(`A API está rodando em http://localhost:${PORT}/api`)
        // console.log('A API está rodando em http://localhost:' + process.env.PORT + '/api')
    })