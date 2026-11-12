import { supabase } from '../db/config.js';

// Request => Tudo o que está sendo enviado para a requisição
// Response => Resultado retornado pela API

async function ListarCategorias(request, response) {
    try {
        const { data: categorias, error } = await supabase
            .from('categorias')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error("Erro ao listar categorias:", error);
            return response.status(500).json({ mensagem: "Erro ao buscar categorias no banco." });
        }

        return response.json({ categorias: categorias || [] });
    } catch (err) {
        console.error("Erro inesperado em ListarCategorias:", err);
        return response.status(500).json({ mensagem: "Erro interno no servidor." });
    }
}

async function CriarCategoria(request, response) {
    try {
        const { nome } = request.body;

        if (!nome) {
            return response.status(400).json({ mensagem: "O nome da categoria é obrigatório." });
        }

        const { error } = await supabase
            .from('categorias')
            .insert([{ nome }]);

        if (error) {
            console.error("Erro ao criar categoria:", error);
            return response.status(500).json({ mensagem: "Erro ao cadastrar categoria." });
        }

        return response.json({
            messagem: "Categoria cadastrada com sucesso!",
            mensagem: "Categoria cadastrada com sucesso!"
        });
    } catch (err) {
        console.error("Erro inesperado em CriarCategoria:", err);
        return response.status(500).json({ mensagem: "Erro interno no servidor." });
    }
}

async function DeletarCategoria(request, response) {
    try {
        const { id } = request.params;

        const { error } = await supabase
            .from('categorias')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Erro ao deletar categoria:", error);
            return response.status(500).json({ mensagem: "Erro ao remover categoria." });
        }

        return response.json({
            mensagem: `A categoria com o id ${id} foi removida com sucesso!`
        });
    } catch (err) {
        console.error("Erro inesperado em DeletarCategoria:", err);
        return response.status(500).json({ mensagem: "Erro interno no servidor." });
    }
}

async function AtualizarCategoria(request, response) {
    try {
        const { id } = request.params;
        const body = request.body;

        if (!body.nome) {
            return response.status(400).json({
                mensagem: "O nome é obrigatório"
            });
        }

        const { error } = await supabase
            .from('categorias')
            .update({ nome: body.nome })
            .eq('id', id);

        if (error) {
            console.error("Erro ao atualizar categoria:", error);
            return response.status(500).json({ mensagem: "Erro ao atualizar categoria." });
        }

        return response.json({
            mensagem: "A categoria foi atualizada com sucesso!"
        });
    } catch (err) {
        console.error("Erro inesperado em AtualizarCategoria:", err);
        return response.status(500).json({ mensagem: "Erro interno no servidor." });
    }
}

export { ListarCategorias, CriarCategoria, DeletarCategoria, AtualizarCategoria };
