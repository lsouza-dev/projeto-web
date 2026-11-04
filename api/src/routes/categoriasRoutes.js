import {ListarCategorias} from '../controllers/categoriasController.js'
import { Router } from 'express';

const categoriasRoutes = new Router()

// Na rota inicial, será executada a função de ListarCategorias
categoriasRoutes.get('/',ListarCategorias)

export default categoriasRoutes;