# PROMPT MESTRE: Desenvolvimento Front-End Autônomo (HTML, CSS, JS Puro)

## 1. Instrução Crítica para a IA Executora (Fase de Descoberta)
**NÃO assuma rotas ou nomes de campos fixos.** Antes de iniciar o desenvolvimento da interface, você (a IA) deve obrigatoriamente realizar a varredura e o mapeamento do projeto nos seguintes locais:
1. **`banco-de-dados/tabelas.sql`**: Para entender o esquema relacional, colunas, chaves estrangeiras e tipos de dados de cada entidade.
2. **`api/src/routes/` e `api/src/controllers/`**: Para mapear os endpoints exatos disponíveis (ex: quais métodos HTTP, quais rotas correspondem a cada recurso, parâmetros de query aceitos para filtros).
3. **`api/src/server.js`**: Para checar o prefixo global das rotas (ex: `/api/...`) e a porta de execução.

---

## 2. Visão Geral do Projeto e Arquitetura
- **Front-end:** 100% Vanilla (HTML5, CSS3, JavaScript ES6+), sem frameworks. Bibliotecas leves via CDN apenas se necessário (ex: FontAwesome).
- **Comunicação:** `fetch` nativo consumindo a API mapeada.
- **Persistência Local (`localStorage` / `sessionStorage`):** Exclusivo para dados de **Sessão do Usuário Admin** e **Carrinho de Compras**.

---

## 3. Requisitos Funcionais Obrigatórios

### A. Página Inicial (`index.html`)
1. **Filtros Server-Side Dinâmicos:**
   - Na primeira linha de conteúdo, exibir barra de filtros contendo inputs, selects (gerados dinamicamente com base nas categorias mapeadas no banco), number, etc.
   - Qualquer alteração nos filtros deve disparar uma requisição para a API mapeada, atualizando o catálogo de forma assíncrona.
2. **Exibição por Categoria (Grid Horizontal com Scroll Suave):**
   - Agrupar os produtos por categoria (uma seção/linha por categoria).
   - Grid de produtos com **setas (arrows) nas laterais** para scroll horizontal suave.
3. **Cards de Produtos:**
   - **Elementos:** Imagem, nome, breve descrição (com `truncate`), valor.
   - **Efeito Visual:** No `hover`, aplicar transição suave com leve alteração no eixo Y (`transform: translateY(-4px)`).
4. **Modal de Detalhes do Produto:**
   - Ao clicar em um card, abrir modal centralizado em **grid de 2 colunas**:
     - Coluna 1: Imagem ocupando 100% do espaço.
     - Coluna 2: Detalhes completos, seletor de quantidade e botão "Adicionar ao Carrinho".
5. **Carrinho de Compras & Checkout:**
   - Gerenciado via `localStorage`.
   - Listagem dos itens adicionados com cálculo automático de subtotal/total.
   - **Checkout via WhatsApp:** Botão que formata automaticamente a mensagem com os itens e dados do carrinho e redireciona para o link do WhatsApp (`https://wa.me/...`).

### B. Painel Administrativo (`admin/login.html` e `admin/dashboard.html`)
1. **Login Simples (Auth):**
   - Formulário centralizado na tela (sem cadastro ou recuperação de senha). Validação contra o endpoint de autenticação descoberto no mapeamento.
   - Armazena a sessão/token do usuário logado no `localStorage`/`sessionStorage`.
2. **Layout do Dashboard (Grid 1fr / 4fr):**
   - **Lateral (1fr):** Informações do usuário logado, listagem dinâmica dos módulos descobertos no projeto e botão de Logout.
   - **Conteúdo (4fr):** Listagem dos registros da entidade selecionada e botões de ação (Criar, Editar, Remover).
3. **Gestão de Recursos (CRUD):**
   - **Criação:** Botão no canto superior direito que abre um modal com formulário gerado dinamicamente com base nas colunas reais da entidade mapeada no SQL.
   - **Sincronia:** Toda alteração reflete imediatamente na API e, consequentemente, na página inicial.

---

## 4. Diretrizes de Design e Comportamento Visual
- **Design System Modular:** Utilizar variáveis CSS (`:root`) para cores, fontes e espaçamentos.
- **Responsividade:** Layout adaptável para desktop e dispositivos móveis.
- **Feedback Visual:** Estados de `loading` claros ao buscar dados da API e mensagens de sucesso/erro amigáveis nas ações do Admin.

---

## 5. Instruções Finais para Execução
Com base no mapeamento inicial que você (IA) fez da estrutura de pastas, rotas e banco de dados, **gere todos os arquivos do front-end necessários** para colocar a aplicação em funcionamento completo.