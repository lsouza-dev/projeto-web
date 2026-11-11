import { Router } from "express";
import { BuscarLojasDoUsuario, BuscarLojaPorId, ListarTodasLojas } from "../controllers/lojasController.js";

const lojasRouter = new Router()

lojasRouter.get('/', ListarTodasLojas);
lojasRouter.get('/:id', BuscarLojaPorId);
lojasRouter.get('/usuario/:id', BuscarLojasDoUsuario);

export default lojasRouter;