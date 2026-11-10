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
        return response.status(404).json({
            mensagem: "Categoria não encontrada"
        })
    }

    const lojaSQL = "SELECT id FROM lojas WHERE id = ?"
    const [loja] = await mySql.query(lojaSQL,id_loja)

    if(!loja[0]){
        return response.status(404).json({
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

async function ListarProdutos(request,response){

    const {id} = request.params;
    const {texto,categoria,qtdMin,qtdMax,precoMin,precoMax} = request.query;
    let params = [id]

    const lojaSql = "SELECT * FROM lojas WHERE id = ?"
    const [loja] = await mySql.query(lojaSql,id)

    if(!loja[0]){
        return response.status(404).json({
            mensagem:"Loja não encontrada"
        })
    }

    let sql = 
    `SELECT
        p.id,
        p.nome,
        p.descricao,
        p.preco,
        p.quantidade,
        c.id as id_categoria,
        c.nome as nome_categoria
    FROM produtos AS p
    INNER JOIN categorias AS c ON c.id = p.id_categoria
    WHERE p.id_loja = ?
    `

    if(texto){
        sql += "AND (p.descricao LIKE ? OR p.nome LIKE ?)"
        params.push(`%${texto}%`)
        params.push(`%${texto}%`)
    }

    if(categoria){
        sql += "AND c.nome LIKE ?"
        params.push(`%${categoria}%`)
    }

    if(precoMin){
        sql += "AND p.preco >= ?"
        params.push(Number(precoMin))
    }

    if(precoMax){
        sql += "AND p.preco <= ?"
        params.push(Number(precoMax))
    }

    if(qtdMin){
        sql += "AND p.quantidade >= ? "
        params.push(Number(qtdMin))
    }


    if(qtdMax){
        sql += "AND p.quantidade <= ? "
        params.push(Number(qtdMax))
    }

    const [produtos] = await mySql.query(sql,params)
    return response.json({produtos})
}

async function AtualizarProduto(request,response){
    const {id} = request.params

    const {
        nome,
        descricao,
        preco,
        quantidade,
        id_categoria,
    } = request.body;

    let campos = []
    let params = []

    if(id_categoria){

        const categoriaSQL = "SELECT id FROM categorias WHERE id = ?"
        const [categoria] = await mySql.query(categoriaSQL,id_categoria)

        if(!categoria[0]){
            return  response.status(404).json({
                mensagem: "Categoria não encontrada"
            })
        }

        campos.push("id_categoria = ?")
        params.push(categoria[0].id)

    }

    if(nome){
        campos.push("nome = ?")
        params.push(nome)
    }

    if(descricao){
        campos.push("descricao = ?")
        params.push(descricao)
    }

    if(preco){
        campos.push("preco = ?")
        params.push(Number(preco))
    }

    if(quantidade){
        campos.push("quantidade = ?")
        params.push(Number(quantidade))
    }

    const sql = `UPDATE produtos SET ${campos.join(',')} WHERE id = ?`
    await mySql.query(sql,[...params,id])

    return response.json({
        mensagem:"Produto atualizado com sucesso!"
    })
}

async function ExcluirProduto(request,response){
    const {id} = request.params;

    const verificaoSql = "SELECT * FROM produtos WHERE id = ?";
    const [produto] = await mySql.query(verificaoSql,id)
    
    console.log(produto[0])

    if(!produto[0]){
        return response.status(404).json({
            mensagem: "Produto não encontrado!"
        })
    }

    const exclusaoSql = "DELETE FROM produtos WHERE id = ?"
    await mySql.query(exclusaoSql,id);

    return response.json({
        mensagem: "Produto excluído com sucesso!"
    })
}

export { CriarProduto , ListarProdutos , AtualizarProduto ,ExcluirProduto }