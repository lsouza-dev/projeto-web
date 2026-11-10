import { Router } from "express";
import { Login } from "../controllers/usuariosController.js";


const usuarioRouter = new Router();

usuarioRouter.post('/login',Login)

export default usuarioRouter;