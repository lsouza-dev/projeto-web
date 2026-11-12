import { supabase } from '../db/config.js';

async function CriarProduto(request, response) {
    try {
        const {
            nome,
            descricao,
            preco,
            quantidade,
            id_categoria,
            id_loja,
            imagem_url
        } = request.body;

        if (!nome) {
            return response.status(400).json({ mensagem: "O nome do produto é obrigatório." });
        }

        if (!id_categoria) {
            return response.status(400).json({
                mensagem: "O id_categoria é obrigatório;"
            });
        }

        if (!id_loja) {
            return response.status(400).json({
                mensagem: "O id_loja é obrigatório;"
            });
        }

        // Valida se a categoria existe
        const { data: categoria, error: erroCategoria } = await supabase
            .from('categorias')
            .select('id')
            .eq('id', id_categoria)
            .maybeSingle();

        if (erroCategoria || !categoria) {
            return response.status(404).json({
                mensagem: "Categoria não encontrada"
            });
        }

        // Valida se a loja existe
        const { data: loja, error: erroLoja } = await supabase
            .from('lojas')
            .select('id')
            .eq('id', id_loja)
            .maybeSingle();

        if (erroLoja || !loja) {
            return response.status(404).json({
                mensagem: "Loja não encontrada"
            });
        }

        const { error } = await supabase
            .from('produtos')
            .insert([{
                nome,
                descricao: descricao || '',
                preco: Number(preco) || 0,
                quantidade: Number(quantidade) || 0,
                id_categoria: Number(id_categoria),
                id_loja: Number(id_loja),
                imagem_url: imagem_url || null
            }]);

        if (error) {
            console.error("Erro ao cadastrar produto:", error);
            return response.status(500).json({ mensagem: "Erro ao cadastrar produto no banco." });
        }

        return response.json({
            mensagem: "Produto cadastrado com sucesso!"
        });
    } catch (err) {
        console.error("Erro inesperado em CriarProduto:", err);
        return response.status(500).json({ mensagem: "Erro interno no servidor." });
    }
}

async function ListarProdutos(request, response) {
    try {
        const { id } = request.params;
        const { texto, categoria, qtdMin, qtdMax, precoMin, precoMax } = request.query;

        // Valida se a loja existe
        const { data: loja, error: erroLoja } = await supabase
            .from('lojas')
            .select('id')
            .eq('id', id)
            .maybeSingle();

        if (erroLoja || !loja) {
            return response.status(404).json({
                mensagem: "Loja não encontrada"
            });
        }

        let query = supabase
            .from('produtos')
            .select('id, nome, descricao, preco, quantidade, imagem_url, id_categoria, categorias!inner(id, nome)')
            .eq('id_loja', id);

        if (texto) {
            query = query.or(`nome.ilike.%${texto}%,descricao.ilike.%${texto}%`);
        }

        if (categoria) {
            query = query.ilike('categorias.nome', `%${categoria}%`);
        }

        if (precoMin) {
            query = query.gte('preco', Number(precoMin));
        }

        if (precoMax) {
            query = query.lte('preco', Number(precoMax));
        }

        if (qtdMin) {
            query = query.gte('quantidade', Number(qtdMin));
        }

        if (qtdMax) {
            query = query.lte('quantidade', Number(qtdMax));
        }

        const { data, error } = await query.order('id', { ascending: true });

        if (error) {
            console.error("Erro ao listar produtos no Supabase:", error);
            return response.status(500).json({ mensagem: "Erro ao buscar produtos." });
        }

        // Mapeia para manter a estrutura exata esperada pelo front-end
        const produtos = (data || []).map(p => ({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao,
            preco: Number(p.preco),
            quantidade: Number(p.quantidade),
            imagem_url: p.imagem_url,
            id_categoria: p.id_categoria,
            nome_categoria: p.categorias ? p.categorias.nome : null
        }));

        return response.json({ produtos });
    } catch (err) {
        console.error("Erro inesperado em ListarProdutos:", err);
        return response.status(500).json({ mensagem: "Erro interno no servidor." });
    }
}

async function AtualizarProduto(request, response) {
    try {
        const { id } = request.params;
        const {
            nome,
            descricao,
            preco,
            quantidade,
            id_categoria,
            imagem_url
        } = request.body;

        const updates = {};

        if (id_categoria) {
            const { data: categoria, error: erroCategoria } = await supabase
                .from('categorias')
                .select('id')
                .eq('id', id_categoria)
                .maybeSingle();

            if (erroCategoria || !categoria) {
                return response.status(404).json({
                    mensagem: "Categoria não encontrada"
                });
            }

            updates.id_categoria = Number(id_categoria);
        }

        if (nome !== undefined) updates.nome = nome;
        if (descricao !== undefined) updates.descricao = descricao;
        if (preco !== undefined) updates.preco = Number(preco);
        if (quantidade !== undefined && quantidade !== null) updates.quantidade = Number(quantidade);
        if (imagem_url !== undefined) updates.imagem_url = imagem_url;

        if (Object.keys(updates).length === 0) {
            return response.status(400).json({ mensagem: "Nenhum campo fornecido para atualização." });
        }

        const { error } = await supabase
            .from('produtos')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error("Erro ao atualizar produto:", error);
            return response.status(500).json({ mensagem: "Erro ao atualizar produto." });
        }

        return response.json({
            mensagem: "Produto atualizado com sucesso!"
        });
    } catch (err) {
        console.error("Erro inesperado em AtualizarProduto:", err);
        return response.status(500).json({ mensagem: "Erro interno no servidor." });
    }
}

async function ExcluirProduto(request, response) {
    try {
        const { id } = request.params;

        const { data: produto, error: erroVerif } = await supabase
            .from('produtos')
            .select('id')
            .eq('id', id)
            .maybeSingle();

        if (erroVerif || !produto) {
            return response.status(404).json({
                mensagem: "Produto não encontrado!"
            });
        }

        const { error } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Erro ao excluir produto:", error);
            return response.status(500).json({ mensagem: "Erro ao excluir produto." });
        }

        return response.json({
            mensagem: "Produto excluído com sucesso!"
        });
    } catch (err) {
        console.error("Erro inesperado em ExcluirProduto:", err);
        return response.status(500).json({ mensagem: "Erro interno no servidor." });
    }
}

async function UploadImagem(request, response) {
    if (!request.file) {
        return response.status(400).json({
            mensagem: "Nenhum arquivo enviado."
        });
    }

    const host = request.get('host');
    const protocol = request.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${request.file.filename}`;

    return response.json({
        mensagem: "Upload realizado com sucesso!",
        imagem_url: fileUrl,
        filename: request.file.filename
    });
}

export { CriarProduto, ListarProdutos, AtualizarProduto, ExcluirProduto, UploadImagem };
