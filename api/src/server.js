import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import categoriasRoutes from "./routes/categoriasRoutes.js";
import produtoRouter from "./routes/produtosRoutes.js";
import usuarioRouter from "./routes/usuariosRoutes.js";
import lojasRouter from "./routes/lojasRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();

// Configuração de CORS para permitir requisições do front-end e Vercel
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuração para JSON nas requisições
app.use(express.json());

// Servir arquivos estáticos de upload
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check para testes
app.get('/api', (request, response) => {
    return response.json({
        status: 'online',
        mensagem: 'API do Mostruário conectada com sucesso ao Supabase!',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/categorias', categoriasRoutes);
app.use('/api/produtos', produtoRouter);
app.use('/api/usuarios', usuarioRouter);
app.use('/api/lojas', lojasRouter);

// Inicializa o servidor apenas quando não estiver rodando como serverless na Vercel
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 A API está rodando em http://localhost:${PORT}/api`);
    });
}

export default app;
