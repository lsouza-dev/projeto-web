import mySql from '../db/config.js'

async function CriarProduto(request,response){
    const {
        nome,
        descricao,
        preco,
        quantidade,
        id_categoria,
        id_loja
    } = request.body;

    if(!id_categoria){
        return response.status(400).json({
            mensagem: "O id_categoria é obrigatório;"
        })
    }

    if(!id_loja){
        return response.status(400).json({
            mensagem: "O id_loja é obrigatório;"
        })
    }
    const categoriaSQL = "SELECT id FROM categorias WHERE id = ?"
    const [categoria] = await mySql.query(categoriaSQL,id_categoria)

    if(!categoria[0]){
        response.status(404).json({
            mensagem: "Categoria não encontrada"
        })
    }

    const lojaSQL = "SELECT id FROM lojas WHERE id = ?"
    const [loja] = await mySql.query(lojaSQL,id_loja)

    if(!loja[0]){
        response.status(404).json({
            mensagem: "Loja não encontrada"
        })
    }

    const produtoSQL = 
      "INSERT INTO produtos "
    + "(nome,descricao,preco,quantidade,id_categoria,id_loja) " 
    + "VALUES (?,?,?,?,?,?)"

    await mySql.query(produtoSQL,
        [nome,descricao,preco,quantidade,id_categoria,id_loja]
    )

    return response.json({
        mensagem: "Produto cadastrado com sucesso!"
    })
}

export { CriarProduto }