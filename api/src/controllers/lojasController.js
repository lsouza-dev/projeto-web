import { supabase } from '../db/config.js';

async function ListarTodasLojas(request, response) {
    try {
        const { data: lojas, error } = await supabase
            .from('lojas')
            .select('id, nome, descricao, imagem_url, id_usuario')
            .order('id', { ascending: true });

        if (error) {
            console.error("Erro ao buscar lojas:", error);
            return response.status(500).json({ mensagem: "Erro ao buscar lojas." });
        }

        return response.json({ lojas: lojas || [] });
    } catch (err) {
        console.error("Erro inesperado em ListarTodasLojas:", err);
        return response.status(500).json({ mensagem: "Erro ao buscar lojas." });
    }
}

async function BuscarLojaPorId(request, response) {
    const { id } = request.params;
    try {
        const { data: loja, error } = await supabase
            .from('lojas')
            .select('id, nome, descricao, imagem_url, id_usuario')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            console.error("Erro ao buscar loja por id:", error);
            return response.status(500).json({ mensagem: "Erro ao buscar loja." });
        }

        if (!loja) {
            return response.status(404).json({ mensagem: "Loja não encontrada." });
        }

        return response.json({ loja });
    } catch (err) {
        console.error("Erro inesperado em BuscarLojaPorId:", err);
        return response.status(500).json({ mensagem: "Erro ao buscar loja." });
    }
}

async function BuscarLojasDoUsuario(request, response) {
    const { id } = request.params;
    try {
        const { data: usuario, error: erroUsuario } = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', id)
            .maybeSingle();

        if (erroUsuario) {
            console.error("Erro ao verificar usuario:", erroUsuario);
            return response.status(500).json({ mensagem: "Erro ao consultar usuário." });
        }

        if (!usuario) {
            return response.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        const { data: lojas, error: erroLojas } = await supabase
            .from('lojas')
            .select('id, nome, descricao, imagem_url')
            .eq('id_usuario', id);

        if (erroLojas) {
            console.error("Erro ao buscar lojas do usuario:", erroLojas);
            return response.status(500).json({ mensagem: "Erro ao buscar lojas do usuário." });
        }

        return response.json({
            lojas: lojas || []
        });
    } catch (err) {
        console.error("Erro inesperado em BuscarLojasDoUsuario:", err);
        return response.status(500).json({ mensagem: "Erro ao buscar lojas do usuário." });
    }
}

export { ListarTodasLojas, BuscarLojaPorId, BuscarLojasDoUsuario };
