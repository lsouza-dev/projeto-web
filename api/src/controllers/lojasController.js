import mySql from '../db/config.js'

async function ListarTodasLojas(request, response) {
    try {
        const sql = `SELECT id, nome, descricao, imagem_url, id_usuario FROM lojas`;
        const [lojas] = await mySql.query(sql);
        return response.json({ lojas });
    } catch (err) {
        return response.status(500).json({ mensagem: "Erro ao buscar lojas." });
    }
}

async function BuscarLojaPorId(request, response) {
    const { id } = request.params;
    try {
        const sql = `SELECT id, nome, descricao, imagem_url, id_usuario FROM lojas WHERE id = ?`;
        const [loja] = await mySql.query(sql, [id]);
        if (!loja[0]) {
            return response.status(404).json({ mensagem: "Loja não encontrada." });
        }
        return response.json({ loja: loja[0] });
    } catch (err) {
        return response.status(500).json({ mensagem: "Erro ao buscar loja." });
    }
}

async function BuscarLojasDoUsuario(request,response){
    const {id} =  request.params;

    const usuarioSql = "SELECT id FROM usuarios WHERE id = ?"
    const [usuario] = await mySql.query(usuarioSql,id)

    if(!usuario[0]){
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

export { ListarTodasLojas, BuscarLojaPorId, BuscarLojasDoUsuario }