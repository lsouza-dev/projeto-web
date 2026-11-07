import { Router } from "express";
import { AtualizarProduto, CriarProduto, ListarProdutos } from "../controllers/produtosController.js";

const produtoRouter = new Router();

produtoRouter.get('/loja/:id', ListarProdutos)
produtoRouter.post('/criar',CriarProduto);
produtoRouter.put('/:id',AtualizarProduto);

export default produtoRouter;