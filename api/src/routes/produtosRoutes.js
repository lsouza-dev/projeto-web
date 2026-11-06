import { Router } from "express";
import { CriarProduto } from "../controllers/produtosController.js";

const produtoRouter = new Router();

produtoRouter.post('/criar',CriarProduto);


export default produtoRouter;