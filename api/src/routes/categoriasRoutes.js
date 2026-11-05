import {AtualizarCategoria, CriarCategoria, DeletarCategoria, ListarCategorias} from '../controllers/categoriasController.js'
import { Router } from 'express';

const categoriasRoutes = new Router()

// Na rota inicial, será executada a função de ListarCategorias
categoriasRoutes.get('/',ListarCategorias)

categoriasRoutes.post('/criar',CriarCategoria)

categoriasRoutes.delete('/:id',DeletarCategoria)

categoriasRoutes.put('/:id', AtualizarCategoria)

export default categoriasRoutes;