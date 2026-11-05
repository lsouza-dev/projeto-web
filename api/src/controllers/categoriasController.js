import mySql from '../db/config.js'

// Request => Tudo o que está sendo enviado para a requisição
// Response => Resultado retornado pela API

async function ListarCategorias(request,response){
    const [categorias] = 
    await mySql.query("SELECT * FROM categorias");

    return response.json({categorias})
}

async function CriarCategoria(request,response){
    const {nome} = request.body; // Pegando o campo "nome" do body (local onde enviamos os dados)

    // A '?' é uma representação de um dado que será inserido no mesmo local
    const sql = "INSERT INTO categorias (nome) VALUES (?)";
    await mySql.query(sql,nome); 
    return response.json({
        messagem:"Categoria cadastrada com sucesso!"
    })
}

async function DeletarCategoria(request,response){
    const {id} = request.params;
    const sql = "DELETE FROM categorias WHERE id = ?"
    await mySql.query(sql,id)
    return response.json({
        mensagem: `A categoria com o id ${id} foi removida com sucesso!`
    })
}

export { ListarCategorias , CriarCategoria , DeletarCategoria }