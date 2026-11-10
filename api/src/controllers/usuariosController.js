import mySql from "../db/config.js";


async function Login(request,response){
    const {email,senha} = request.body;

    if(!email){
        return response.status(400).json({
            mensagem: "O email é obrigatório."
        })
    }

    if(!senha){
        return response.status(400).json({
            mensagem: "A senha é obrigatória."
        })
    }

    const sql = `
        SELECT *
        FROM usuarios 
        WHERE LOWER(email) = ?
    `

    const [usuario] = 
    await mySql.query(sql,
        [email.toLowerCase()]
    )

    if(!usuario[0]){
        return response.status(401).json({
            mensagem: "Nenhuma conta foi encontrada para este email;"
        })
    }

    if(senha !== usuario[0].senha){
        return response.status(401).json({
            mensagem: "Usuário ou senha incorretos;"
        })
    }

    return response.json({
        usuario:{
            id: usuario[0].id,
            nome: usuario[0].nome,
            email: usuario[0].email
        }
    })
}

export { Login }