import { Router } from "express";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { AtualizarProduto, CriarProduto, ExcluirProduto, ListarProdutos, UploadImagem } from "../controllers/produtosController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'produto-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas.'));
    }
  }
});

const produtoRouter = new Router();

produtoRouter.get('/loja/:id', ListarProdutos);
produtoRouter.post('/criar', CriarProduto);
produtoRouter.post('/upload', upload.single('imagem'), UploadImagem);
produtoRouter.put('/:id', AtualizarProduto);
produtoRouter.delete('/:id', ExcluirProduto);

export default produtoRouter;