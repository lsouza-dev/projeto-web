import mySql from '../db/config.js'

async function BuscarLojasDoUsuario(request,response){
    const {id} =  request.params;

    const usuarioSql = "SELECT id FROM usuarios WHERE id = ?"
    const [usuario] = await mySql.query(usuarioSql,id)

    if(!usuario[0].id){
        return response.status(404).json({
            mensagem: "Usuário não encontrado."
        })
    }

    const sql = `
        SELECT id,nome,descricao,imagem_url
        FROM lojas
        WHERE id_usuario = ?
    `

    const [lojas] = await mySql.query(sql,id)
    return response.json({
        lojas
    })

}

export {BuscarLojasDoUsuario}