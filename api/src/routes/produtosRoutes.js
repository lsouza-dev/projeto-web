import { Router } from "express";
import { AtualizarProduto, CriarProduto, ExcluirProduto, ListarProdutos } from "../controllers/produtosController.js";

const produtoRouter = new Router();

produtoRouter.get('/loja/:id', ListarProdutos)
produtoRouter.post('/criar',CriarProduto);
produtoRouter.put('/:id',AtualizarProduto);
produtoRouter.delete('/:id',ExcluirProduto)

export default produtoRouter;