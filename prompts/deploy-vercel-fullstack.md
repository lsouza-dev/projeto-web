# GUIA DEFINITIVO: Deploy Fullstack na Vercel (Front-end Estático + API Express Serverless + Supabase)

Este documento registra todas as decisões de arquitetura, configurações necessárias e soluções para os erros enfrentados no processo de deploy unificado de um projeto web monorepo na Vercel.

---

## 1. Visão Geral da Arquitetura

O objetivo é manter o repositório organizado com front-end e backend separados, mas executá-los sob **um único domínio na Vercel** (ex: `https://seu-app.vercel.app`):

- **`/`**: Entrega o catálogo estático (`site/index.html`).
- **`/admin`**: Entrega o painel administrativo (`site/admin/login.html`).
- **`/api/...`**: Executa a API Node/Express como Serverless Function conectada ao Supabase.

### Estrutura do Projeto
```text
projeto-web/
├── api/
│   ├── src/
│   │   ├── controllers/       # Regras de negócio consumindo o Supabase
│   │   ├── db/config.js       # Cliente @supabase/supabase-js
│   │   ├── routes/            # Rotas Express
│   │   └── server.js          # Express configurado para API e arquivos estáticos
│   ├── index.js               # Export default app (para a Serverless Function)
│   └── package.json           # Dependências da API (@supabase/supabase-js, express, cors, etc.)
├── banco-de-dados/
│   ├── supabase_migration.sql # DDL do banco no PostgreSQL/Supabase
│   └── supabase_permissoes_e_dados.sql # Políticas de RLS e Carga Inicial
├── public/                    # Gerado automaticamente pelo build
├── scripts/
│   └── build.js               # Script multiplataforma de cópia de estáticos
├── site/                      # Código-fonte do Front-end (Vanilla HTML, CSS, JS)
│   ├── admin/                 # Painel administrativo
│   ├── index.html             # Vitrine
│   ├── main.js                # Lógica e consumo de /api
│   └── style.css
├── package.json               # Gerenciador da raiz (workspaces e scripts)
└── vercel.json                # Regras de roteamento da Vercel
```

---

## 2. Histórico de Erros & Soluções Aplicadas

Durante o processo de deploy, enfrentamos 5 cenários clássicos da Vercel. Abaixo está o diagnóstico e a correção definitiva de cada um:

### Erro 1: `[STATIC_BUILD_NO_OUT_DIR] No Output Directory named "public" found`
- **Causa:** Ao definir um comando `"build"` no `package.json` da raiz sem especificar uma pasta de saída padrão, a Vercel procura obrigatoriamente por uma pasta chamada `public`. Como o front-end estava dentro de `site/`, o build quebrava.
- **Solução:** Criamos o script [scripts/build.js](file:///C:/Users/SALA103B/Desktop/projeto-web/scripts/build.js) que copia o conteúdo de `site/` para `public/` automaticamente antes do deploy:
  ```javascript
  // scripts/build.js
  import fs from 'fs';
  import path from 'path';

  const srcDir = path.resolve('site');
  const destPublic = path.resolve('public');
  const destApiPublic = path.resolve('api/public');

  [destPublic, destApiPublic].forEach(dest => {
      if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
      fs.cpSync(srcDir, dest, { recursive: true });
  });
  ```

---

### Erro 2: `No entrypoint found in output directory: "site"`
- **Causa:** Tentamos contornar o Erro 1 definindo `"outputDirectory": "site"` no `vercel.json`. Porém, como o projeto possui um backend Node, a Vercel detectou o Framework Preset como **Node.js** e procurou por arquivos de servidor (`index.js`, `server.js`, `app.js`) dentro da pasta `site/`. Como `site/` é apenas HTML/CSS/JS, o deploy falhou.
- **Solução:** Removemos qualquer menção a `outputDirectory` do `vercel.json`. Ao utilizar a pasta padrão nativa `public/` gerada pelo script de build, a Vercel publica os estáticos sem tentar tratá-los como backend.

---

### Erro 3: `Cannot GET /` e conflitos de roteamento
- **Causa:** Existia um arquivo antigo `api/vercel.json` dentro da pasta `api/` com a regra `source: "/(.*)" -> destination: "/index.js"`. A Vercel priorizou esse arquivo e interceptou absolutamente todas as requisições do domínio (inclusive a página inicial `/`), enviando-as para o Express, que não tinha rota para `/`.
- **Solução:** 
  1. Excluímos definitivamente o `api/vercel.json`.
  2. Mantivemos apenas o [vercel.json](file:///C:/Users/SALA103B/Desktop/projeto-web/vercel.json) na raiz do projeto.

---

### Erro 4: `Cannot GET /index.js`
- **Causa:** No rewrite do `vercel.json`, se o destino da Serverless Function for escrito como `"/api/index.js"`, a Vercel entrega para o Express o `req.url` literal de `"/index.js"`. O Express procura uma rota `/index.js`, não encontra e devolve 404.
- **Solução:** No `vercel.json`, o destino correto de uma função Serverless em `api/index.js` é simplesmente `"/api"`:
  ```json
  {
    "source": "/api/(.*)",
    "destination": "/api"
  }
  ```

---

### Erro 5: Rota `/` retornando o JSON de Health Check da API
- **Causa:** No `api/src/server.js`, a rota de teste da API estava definida como `app.get(['/api', '/'])`. Quando a requisição raiz chegava ao servidor, o Express devolvia o JSON `{"status": "online"}` em vez de renderizar o HTML da vitrine.
- **Solução:**
  1. O health check foi restrito exclusivamente para `GET /api`.
  2. O Express foi configurado para servir a pasta estática e entregar `index.html` na rota `/` e `admin/login.html` na rota `/admin`.

---

## 3. Arquivos de Configuração Finais

### A. [package.json](file:///C:/Users/SALA103B/Desktop/projeto-web/package.json) (Raiz)
```json
{
  "name": "projeto-web",
  "version": "1.0.0",
  "private": true,
  "description": "Mostruário Fashion E-Commerce com API Express e Supabase",
  "type": "module",
  "workspaces": [
    "api"
  ],
  "scripts": {
    "build": "node scripts/build.js",
    "start": "npm --prefix api start"
  }
}
```

### B. [vercel.json](file:///C:/Users/SALA103B/Desktop/projeto-web/vercel.json) (Raiz)
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/admin",
      "destination": "/admin/login.html"
    }
  ]
}
```

### C. [api/index.js](file:///C:/Users/SALA103B/Desktop/projeto-web/api/index.js)
```javascript
import app from "./src/server.js";

export default app;
```

### D. [api/src/server.js](file:///C:/Users/SALA103B/Desktop/projeto-web/api/src/server.js) (Trecho Principal)
```javascript
// Servir Front-end Estático
const localPublic = path.resolve(__dirname, '../public');
const rootPublic = path.resolve(__dirname, '../../public');
const rootSite = path.resolve(__dirname, '../../site');

const staticPath = fs.existsSync(localPublic) 
    ? localPublic 
    : (fs.existsSync(rootPublic) ? rootPublic : rootSite);

app.use(express.static(staticPath));
app.use('/admin', express.static(path.join(staticPath, 'admin')));

// Rotas de páginas
app.get('/admin', (req, res) => res.sendFile(path.join(staticPath, 'admin/login.html')));
app.get('/', (req, res) => res.sendFile(path.join(staticPath, 'index.html')));

// Health check da API
app.get('/api', (req, res) => res.json({
    status: 'online',
    mensagem: 'API do Mostruário conectada com sucesso ao Supabase!',
    timestamp: new Date().toISOString()
}));

// Execução local
if (!process.env.VERCEL) {
    app.listen(PORT, () => console.log(`🚀 Rodando em http://localhost:${PORT}`));
}

export default app;
```

---

## 4. Passo a Passo para Novos Deploys

1. **Subir as alterações no Git**:
   ```powershell
   git add .
   git commit -m "feat: configuracao de deploy fullstack vercel"
   git push origin main
   ```

2. **Configuração na Vercel (Project Settings)**:
   - **Root Directory**: `./` (raiz do repositório).
   - **Framework Preset**: `Other`.
   - **Build Command**: `npm run build` (ou deixe o padrão que ele detecta automaticamente).
   - **Output Directory**: Deixar em branco (usará a pasta `public/` nativa).

3. **Variáveis de Ambiente (Environment Variables)**:
   - `SUPABASE_URL`: URL do seu projeto no Supabase (`https://<ref>.supabase.co`).
   - `SUPABASE_KEY`: Chave da API (Publishable ou Secret).
   - `SUPABASE_PUBLISHABLE_KEY`: Chave publishable do projeto.

---

## 5. Checklist de Verificação Pós-Deploy

- [ ] Acessar `https://seu-projeto.vercel.app/` ➔ Deve abrir a vitrine com o catálogo de produtos e imagens.
- [ ] Acessar `https://seu-projeto.vercel.app/admin` ➔ Deve abrir o formulário de login administrativo.
- [ ] Acessar `https://seu-projeto.vercel.app/api` ➔ Deve retornar o JSON `{"status": "online", ...}`.
- [ ] Acessar `https://seu-projeto.vercel.app/api/categorias` ➔ Deve retornar as categorias do Supabase.
- [ ] Acessar `https://seu-projeto.vercel.app/api/produtos/1` ➔ Deve retornar os produtos da loja 1 com sucesso.

