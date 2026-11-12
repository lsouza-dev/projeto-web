-- =============================================================================
-- PERMISSÕES PÚBLICAS & CARGA INICIAL (SUPABASE SQL EDITOR)
-- Execute este script no SQL Editor do Supabase para liberar as permissões
-- de INSERT, UPDATE e DELETE e inserir os dados iniciais do mostruário.
-- =============================================================================

-- 1. Desativa RLS e concede privilégios totais aos papéis do Supabase
ALTER TABLE IF EXISTS public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lojas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.produtos DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.usuarios TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.categorias TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.lojas TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.produtos TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Políticas de segurança permissivas (caso RLS seja reativado no futuro)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total usuarios" ON public.usuarios;
CREATE POLICY "Acesso total usuarios" ON public.usuarios FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total categorias" ON public.categorias;
CREATE POLICY "Acesso total categorias" ON public.categorias FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total lojas" ON public.lojas;
CREATE POLICY "Acesso total lojas" ON public.lojas FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total produtos" ON public.produtos;
CREATE POLICY "Acesso total produtos" ON public.produtos FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. Inserção dos dados iniciais

-- Usuário Administrador
INSERT INTO public.usuarios (id, nome, email, senha)
VALUES (1, 'Admin Aura', 'admin@mostruario.com', '123456')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, email = EXCLUDED.email, senha = EXCLUDED.senha;

-- Loja Principal
INSERT INTO public.lojas (id, nome, descricao, imagem_url, id_usuario)
VALUES (
    1,
    'Aura Moda Oficial',
    'Coleção contemporânea com alfaiataria premium e peças essenciais para o dia a dia.',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    1
)
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, descricao = EXCLUDED.descricao, imagem_url = EXCLUDED.imagem_url;

-- Categorias
INSERT INTO public.categorias (id, nome) VALUES
(1, 'Camisas & Blusas'),
(2, 'Calças & Alfaiataria'),
(3, 'Vestidos & Conjuntos'),
(4, 'Casacos & Jaquetas'),
(5, 'Calçados & Acessórios')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

-- Produtos com Fotos Reais
INSERT INTO public.produtos (id, nome, descricao, preco, quantidade, id_categoria, id_loja, imagem_url) VALUES
(1, 'Camiseta Oversized Minimalist', 'Algodão peruano 240g, modelagem oversized moderna com toque macio.', 129.90, 45, 1, 1, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'),
(2, 'Camisa Linho Pura Alfaiataria', 'Linho misto respirável, caimento impecável e botões madrepérola.', 219.00, 28, 1, 1, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80'),
(3, 'Calça Alfaiataria Wide Leg', 'Tecido fluido premium com corte reto elegante e cintura média-alta.', 259.90, 20, 2, 1, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80'),
(4, 'Calça Jeans Vintage Classic', 'Denim 100% algodão com lavagem retrô e modelagem reta atemporal.', 279.00, 32, 2, 1, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80'),
(5, 'Vestido Midi Silk Touch', 'Toque sedoso com decote sutil e fenda lateral contemporânea.', 349.90, 15, 3, 1, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80'),
(6, 'Trench Coat Clássico Bege', 'Composição impermeável com cinto ajustável e forro xadrez acetinado.', 489.00, 12, 4, 1, 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80'),
(7, 'Jaqueta Couro Biker Premium', 'Acabamento em couro ecológico premium com zíperes metálicos reforçados.', 399.00, 18, 4, 1, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80'),
(8, 'Tênis Couro Branco Clean', 'Design minimalista, solado costurado com palmilha anatômica em gel.', 299.90, 25, 5, 1, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO UPDATE SET 
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    preco = EXCLUDED.preco,
    quantidade = EXCLUDED.quantidade,
    imagem_url = EXCLUDED.imagem_url;

-- Sincronizar sequências
SELECT setval(pg_get_serial_sequence('public.usuarios', 'id'), COALESCE(MAX(id), 1)) FROM public.usuarios;
SELECT setval(pg_get_serial_sequence('public.categorias', 'id'), COALESCE(MAX(id), 1)) FROM public.categorias;
SELECT setval(pg_get_serial_sequence('public.lojas', 'id'), COALESCE(MAX(id), 1)) FROM public.lojas;
SELECT setval(pg_get_serial_sequence('public.produtos', 'id'), COALESCE(MAX(id), 1)) FROM public.produtos;

