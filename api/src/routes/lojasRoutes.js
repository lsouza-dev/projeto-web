import { Router } from "express";
import { BuscarLojasDoUsuario } from "../controllers/lojasController.js";

const lojasRouter = new Router()

lojasRouter.get('/usuario/:id', BuscarLojasDoUsuario)

export default lojasRouter;