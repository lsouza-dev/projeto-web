import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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

// Configuração de CORS permissivo
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Suporte a JSON nas requisições
app.use(express.json());

// Servir uploads locais
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 1. ROTAS DA API
// Health check restrito à rota /api
app.get('/api', (request, response) => {
    return response.json({
        status: 'online',
        mensagem: 'API do Mostruário conectada com sucesso ao Supabase!',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/categorias', categoriasRoutes);
app.use('/categorias', categoriasRoutes);

app.use('/api/produtos', produtoRouter);
app.use('/produtos', produtoRouter);

app.use('/api/usuarios', usuarioRouter);
app.use('/usuarios', usuarioRouter);

app.use('/api/lojas', lojasRouter);
app.use('/lojas', lojasRouter);

// 2. SERVIR FRONT-END ESTÁTICO (SITE & PAINEL ADMIN)
const localPublic = path.resolve(__dirname, '../public');
const rootPublic = path.resolve(__dirname, '../../public');
const rootSite = path.resolve(__dirname, '../../site');

const staticPath = fs.existsSync(localPublic) 
    ? localPublic 
    : (fs.existsSync(rootPublic) ? rootPublic : rootSite);

app.use(express.static(staticPath));
app.use('/admin', express.static(path.join(staticPath, 'admin')));

// Entrega do Painel Administrativo em /admin
app.get('/admin', (request, response) => {
    response.sendFile(path.join(staticPath, 'admin/login.html'));
});

// Entrega do Catálogo Principal na raiz /
app.get('/', (request, response) => {
    response.sendFile(path.join(staticPath, 'index.html'));
});

// Inicializa o servidor localmente
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 A API está rodando em http://localhost:${PORT}`);
        console.log(`👗 Catálogo: http://localhost:${PORT}/`);
        console.log(`🔐 Painel Admin: http://localhost:${PORT}/admin`);
    });
}

export default app;
