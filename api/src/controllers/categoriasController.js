import mySql from '../db/config.js'

async function ListarCategorias(request,response){
    const [categorias] = 
    await mySql.query("SELECT * FROM categorias");

    return response.json({categorias})
}

export { ListarCategorias }