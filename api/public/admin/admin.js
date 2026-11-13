/**
 * PAINEL ADMINISTRATIVO - AURA MODA
 * Mapeamento e CRUD 100% Vanilla em sincronia com a API
 */

// =============================================================================
// VERIFICAÇÃO DE SESSÃO & CONFIGURAÇÃO
// =============================================================================
const storedUserRaw = localStorage.getItem('admin_user') || sessionStorage.getItem('admin_user');
if (!storedUserRaw) {
  window.location.href = 'login.html';
}

const currentUser = JSON.parse(storedUserRaw || '{}');

const API_CANDIDATES = [
  'http://localhost:3000/api',
  'http://localhost:3333/api',
  '/api'
];

let ACTIVE_API_BASE = localStorage.getItem('mostruario_api_base') || API_CANDIDATES[0];
let activeLojaId = parseInt(localStorage.getItem('mostruario_loja_id') || '1', 10);

// Estado da Aplicação Admin
const adminState = {
  currentModule: 'produtos', // 'produtos', 'categorias', 'lojas'
  modules: [
    { id: 'produtos', name: 'Produtos', icon: 'fa-shirt', endpoint: '/produtos' },
    { id: 'categorias', name: 'Categorias', icon: 'fa-tags', endpoint: '/categorias' },
    { id: 'lojas', name: 'Lojas', icon: 'fa-store', endpoint: '/lojas' }
  ],
  categoriesData: [],
  storesData: [],
  recordsData: [],
  editingRecordId: null,
  pendingDeleteId: null,
  pendingImageFile: null
};

// =============================================================================
// INICIALIZAÇÃO
// =============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  initAdminTheme();
  renderUserInfo();
  renderSidebarModules();
  setupEventListeners();
  await detectActiveApi();
  await loadInitialAuxiliaryData();
  await switchModule('produtos');
});

function initAdminTheme() {
  const saved = localStorage.getItem('mostruario_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  applyAdminTheme(saved);

  const toggleBtn = document.getElementById('adminThemeToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyAdminTheme(next);
      showAdminToast(`Modo ${next === 'dark' ? 'Escuro' : 'Claro'} ativado.`);
    });
  }
}

function applyAdminTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('mostruario_theme', theme);

  const icon = document.getElementById('adminThemeToggleIcon');
  if (icon) {
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
      icon.style.color = '#f59e0b';
    } else {
      icon.className = 'fa-solid fa-moon';
      icon.style.color = '';
    }
  }
}

function renderUserInfo() {
  const nameEl = document.getElementById('userDisplayName');
  const emailEl = document.getElementById('userDisplayEmail');
  const avatarEl = document.getElementById('userAvatarLetter');

  if (nameEl) nameEl.textContent = currentUser.nome || 'Administrador';
  if (emailEl) emailEl.textContent = currentUser.email || 'admin@mostruario.com';
  if (avatarEl) {
    avatarEl.textContent = (currentUser.nome || 'A').charAt(0).toUpperCase();
  }
}

async function detectActiveApi() {
  for (const candidate of API_CANDIDATES) {
    try {
      const res = await fetch(`${candidate}/categorias`);
      if (res.ok) {
        ACTIVE_API_BASE = candidate;
        localStorage.setItem('mostruario_api_base', ACTIVE_API_BASE);
        break;
      }
    } catch (e) {
      // tenta próxima
    }
  }
}

async function loadInitialAuxiliaryData() {
  try {
    // Carrega Categorias
    const resCat = await fetch(`${ACTIVE_API_BASE}/categorias`);
    if (resCat.ok) {
      const d = await resCat.json();
      adminState.categoriesData = d.categorias || [];
      populateAdminCategoryFilter();
    }

    // Carrega Lojas do Usuário (ou todas as lojas disponíveis)
    let fetchedStores = [];
    try {
      const resLojas = await fetch(`${ACTIVE_API_BASE}/lojas/usuario/${currentUser.id || 1}`);
      if (resLojas.ok) {
        const d = await resLojas.json();
        fetchedStores = d.lojas || [];
      }
    } catch (e) {}

    if (fetchedStores.length === 0) {
      try {
        const resAll = await fetch(`${ACTIVE_API_BASE}/lojas`);
        if (resAll.ok) {
          const dAll = await resAll.json();
          fetchedStores = dAll.lojas || [];
        }
      } catch (e) {}
    }

    adminState.storesData = fetchedStores;

    if (adminState.storesData.length > 0) {
      const savedLojaId = parseInt(localStorage.getItem('mostruario_loja_id') || '0', 10);
      const matched = adminState.storesData.find(l => l.id === savedLojaId);
      if (matched) {
        activeLojaId = matched.id;
      } else {
        activeLojaId = adminState.storesData[0].id;
      }
      localStorage.setItem('mostruario_loja_id', activeLojaId);
      populateAdminStoreSelector();
    }
  } catch (err) {
    console.error('Erro ao carregar dados auxiliares:', err);
  }
}

/**
 * Preenche o seletor de lojas na barra lateral do admin
 */
function populateAdminStoreSelector() {
  const select = document.getElementById('adminActiveStoreSelect');
  if (!select) return;

  select.innerHTML = '';
  adminState.storesData.forEach(loja => {
    const opt = document.createElement('option');
    opt.value = loja.id;
    opt.textContent = loja.nome;
    if (loja.id === activeLojaId) opt.selected = true;
    select.appendChild(opt);
  });

  select.onchange = async (e) => {
    const newId = parseInt(e.target.value, 10);
    const loja = adminState.storesData.find(l => l.id === newId);
    if (!loja) return;

    activeLojaId = newId;
    localStorage.setItem('mostruario_loja_id', activeLojaId);

    showAdminToast(`Loja ativa alterada para: ${loja.nome}`, 'success');
    updateKpis();

    if (adminState.currentModule === 'produtos') {
      await loadCurrentModuleData();
    }
  };
}

// =============================================================================
// SIDEBAR & MÓDULOS (Layout Grid 1fr)
// =============================================================================
function renderSidebarModules() {
  const listEl = document.getElementById('sidebarModulesList');
  if (!listEl) return;

  listEl.innerHTML = '';
  adminState.modules.forEach(mod => {
    const li = document.createElement('li');
    li.innerHTML = `
      <button type="button" class="sidebar-module-btn ${mod.id === adminState.currentModule ? 'active' : ''}" data-module="${mod.id}">
        <span class="module-info">
          <i class="fa-solid ${mod.icon}"></i>
          <span>${mod.name}</span>
        </span>
        <span class="module-count" id="badge_count_${mod.id}">-</span>
      </button>
    `;
    listEl.appendChild(li);
  });

  // Eventos de clique nos botões de módulos
  listEl.querySelectorAll('.sidebar-module-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modId = btn.getAttribute('data-module');
      switchModule(modId);
    });
  });
}

async function switchModule(moduleId) {
  adminState.currentModule = moduleId;

  // Atualiza classe ativa na sidebar
  document.querySelectorAll('.sidebar-module-btn').forEach(btn => {
    if (btn.getAttribute('data-module') === moduleId) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Atualiza Título e Descrição do Cabeçalho (4fr)
  const titleEl = document.getElementById('activeModuleTitle');
  const descEl = document.getElementById('activeModuleDesc');
  const createBtnLabel = document.getElementById('createEntityBtnLabel');
  const createBtn = document.getElementById('btnOpenCreateModal');

  if (moduleId === 'produtos') {
    if (titleEl) titleEl.textContent = 'Gestão de Produtos';
    if (descEl) descEl.textContent = 'Cadastre, edite e acompanhe o estoque e preços das roupas do mostruário.';
    if (createBtnLabel) createBtnLabel.textContent = 'Novo Produto';
    if (createBtn) createBtn.style.display = 'inline-flex';
  } else if (moduleId === 'categorias') {
    if (titleEl) titleEl.textContent = 'Gestão de Categorias';
    if (descEl) descEl.textContent = 'Organize as seções do mostruário (ex: Camisetas, Bermudas, Tênis, Meias).';
    if (createBtnLabel) createBtnLabel.textContent = 'Nova Categoria';
    if (createBtn) createBtn.style.display = 'inline-flex';
  } else if (moduleId === 'lojas') {
    if (titleEl) titleEl.textContent = 'Lojas do Usuário';
    if (descEl) descEl.textContent = 'Lojas vinculadas à sua conta administrativa.';
    if (createBtn) createBtn.style.display = 'none'; // A API atual possui consulta de lojas do usuário
  }

  // Alterna visibilidade da barra de filtros de produtos vs busca simples
  const prodFilterBar = document.getElementById('adminProductsFilterBar');
  const simpleToolbar = document.getElementById('adminSimpleToolbar');

  if (moduleId === 'produtos') {
    if (prodFilterBar) prodFilterBar.style.display = 'flex';
    if (simpleToolbar) simpleToolbar.style.display = 'none';
  } else {
    if (prodFilterBar) prodFilterBar.style.display = 'none';
    if (simpleToolbar) simpleToolbar.style.display = 'flex';
  }

  await loadCurrentModuleData();
}

// =============================================================================
// CARREGAMENTO DE DADOS & TABELA DO CONTEÚDO (Layout Grid 4fr)
// =============================================================================
async function loadCurrentModuleData() {
  const tableBody = document.getElementById('tableBody');
  if (tableBody) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Carregando registros...</td></tr>`;
  }

  try {
    if (adminState.currentModule === 'produtos') {
      const res = await fetch(`${ACTIVE_API_BASE}/produtos/loja/${activeLojaId}`);
      if (res.ok) {
        const d = await res.json();
        adminState.recordsData = d.produtos || [];
      }
    } else if (adminState.currentModule === 'categorias') {
      const res = await fetch(`${ACTIVE_API_BASE}/categorias`);
      if (res.ok) {
        const d = await res.json();
        adminState.recordsData = d.categorias || [];
        adminState.categoriesData = adminState.recordsData;
      }
    } else if (adminState.currentModule === 'lojas') {
      const res = await fetch(`${ACTIVE_API_BASE}/lojas/usuario/${currentUser.id || 1}`);
      if (res.ok) {
        const d = await res.json();
        adminState.recordsData = d.lojas || [];
      }
    }

    if (adminState.currentModule === 'produtos') {
      applyAdminProductFilters();
    } else {
      renderTable(adminState.recordsData);
    }
    updateKpis();
    updateModuleBadges();
  } catch (err) {
    console.error('Erro ao carregar dados do módulo:', err);
    showAdminToast('Erro ao sincronizar com a API.', 'error');
  }
}

function updateKpis() {
  const kpiVal1 = document.getElementById('kpiVal1');
  const kpiVal2 = document.getElementById('kpiVal2');
  const kpiVal3 = document.getElementById('kpiVal3');
  const kpiVal4 = document.getElementById('kpiVal4');

  if (kpiVal1) {
    const totalProd = adminState.currentModule === 'produtos' ? adminState.recordsData.length : '-';
    kpiVal1.textContent = totalProd;
  }

  if (kpiVal2) {
    kpiVal2.textContent = adminState.categoriesData.length;
  }

  if (kpiVal3) {
    const lojaAtiva = adminState.storesData.find(l => l.id === activeLojaId) || adminState.storesData[0];
    kpiVal3.textContent = lojaAtiva ? lojaAtiva.nome : 'Senac Moda';
  }

  if (kpiVal4) {
    if (adminState.currentModule === 'produtos' && adminState.recordsData.length > 0) {
      const totalInventoryVal = adminState.recordsData.reduce((acc, p) => acc + (Number(p.preco || 0) * Number(p.quantidade || 0)), 0);
      kpiVal4.textContent = totalInventoryVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } else {
      kpiVal4.textContent = '-';
    }
  }
}

function updateModuleBadges() {
  const bProds = document.getElementById('badge_count_produtos');
  const bCats = document.getElementById('badge_count_categorias');
  const bLojas = document.getElementById('badge_count_lojas');

  if (bCats) bCats.textContent = adminState.categoriesData.length;
  if (bLojas) bLojas.textContent = adminState.storesData.length;
  if (bProds && adminState.currentModule === 'produtos') {
    bProds.textContent = adminState.recordsData.length;
  }
}

function renderTable(records) {
  const thead = document.getElementById('tableHead');
  const tbody = document.getElementById('tableBody');
  const countEl = document.getElementById('tableRecordCount');
  const countSimpleEl = document.getElementById('tableRecordCountSimple');

  if (countEl) countEl.textContent = records.length;
  if (countSimpleEl) countSimpleEl.textContent = records.length;
  if (!thead || !tbody) return;

  tbody.innerHTML = '';

  if (adminState.currentModule === 'produtos') {
    thead.innerHTML = `
      <tr>
        <th style="width: 40px;">ID</th>
        <th style="width: 56px;">Foto</th>
        <th>Peça / Nome</th>
        <th>Categoria</th>
        <th>Preço Unitário</th>
        <th>Estoque</th>
        <th style="width: 140px; text-align: center;">Ações</th>
      </tr>
    `;

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">Nenhum produto cadastrado nesta loja.</td></tr>`;
      return;
    }

    records.forEach(prod => {
      const tr = document.createElement('tr');
      const precoBrl = Number(prod.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const stockBadgeClass = prod.quantidade > 0 ? 'color: var(--success); font-weight: 700;' : 'color: var(--danger); font-weight: 700;';
      const thumbUrl = prod.imagem_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=120&q=80';

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-muted);">${prod.id}</td>
        <td>
          <img src="${thumbUrl}" alt="${escapeHtml(prod.nome)}" class="table-thumbnail" onerror="this.src='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=120&q=80'">
        </td>
        <td>
          <div style="font-weight: 700; color: var(--text-main);">${escapeHtml(prod.nome)}</div>
          <div style="font-size: 0.775rem; color: var(--text-muted); max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHtml(prod.descricao || 'Sem descrição')}
          </div>
        </td>
        <td>
          <span style="display: inline-block; padding: 2px 8px; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; background: #f1f5f9; color: var(--admin-primary);">
            ${escapeHtml(prod.nome_categoria || 'Moda')}
          </span>
        </td>
        <td style="font-weight: 700;">${precoBrl}</td>
        <td>
          <span style="${stockBadgeClass}">${prod.quantidade} un.</span>
        </td>
        <td style="text-align: center;">
          <div class="table-actions-cell" style="justify-content: center;">
            <button type="button" class="btn-action-sm btn-action-edit" title="Editar produto" onclick="openEditRecordModal(${prod.id})">
              <i class="fa-solid fa-pen-to-square"></i> Editar
            </button>
            <button type="button" class="btn-action-sm btn-action-delete" title="Excluir produto" onclick="promptDeleteRecord(${prod.id}, '${escapeHtml(prod.nome)}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } else if (adminState.currentModule === 'categorias') {
    thead.innerHTML = `
      <tr>
        <th style="width: 80px;">ID</th>
        <th>Nome da Categoria</th>
        <th style="width: 140px; text-align: center;">Ações</th>
      </tr>
    `;

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 32px; color: var(--text-muted);">Nenhuma categoria cadastrada.</td></tr>`;
      return;
    }

    records.forEach(cat => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-muted);">${cat.id}</td>
        <td style="font-weight: 600; color: var(--text-main);">${escapeHtml(cat.nome)}</td>
        <td style="text-align: center;">
          <div class="table-actions-cell" style="justify-content: center;">
            <button type="button" class="btn-action-sm btn-action-edit" title="Editar categoria" onclick="openEditRecordModal(${cat.id})">
              <i class="fa-solid fa-pen-to-square"></i> Editar
            </button>
            <button type="button" class="btn-action-sm btn-action-delete" title="Excluir categoria" onclick="promptDeleteRecord(${cat.id}, '${escapeHtml(cat.nome)}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } else if (adminState.currentModule === 'lojas') {
    thead.innerHTML = `
      <tr>
        <th style="width: 60px;">ID</th>
        <th>Nome da Loja</th>
        <th>Descrição</th>
        <th>ID Usuário Proprietário</th>
      </tr>
    `;

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 32px; color: var(--text-muted);">Nenhuma loja cadastrada.</td></tr>`;
      return;
    }

    records.forEach(loja => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-muted);">${loja.id}</td>
        <td style="font-weight: 700; color: var(--text-main);">${escapeHtml(loja.nome)}</td>
        <td style="color: var(--text-muted);">${escapeHtml(loja.descricao || '-')}</td>
        <td><span style="padding: 2px 8px; background: #f1f5f9; border-radius: 4px; font-weight: 600;">ID: ${loja.id_usuario || currentUser.id || 1}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// =============================================================================
// MODAL CRUD DINÂMICO
// Gerado dinamicamente com base nas colunas reais mapeadas no SQL:
// - produtos: nome, descricao, preco, quantidade, id_categoria, id_loja
// - categorias: nome
// =============================================================================
function openCreateRecordModal() {
  adminState.editingRecordId = null;
  adminState.pendingImageFile = null;
  const modalTitle = document.getElementById('crudModalTitle');
  const container = document.getElementById('crudModalFieldsContainer');

  if (adminState.currentModule === 'produtos') {
    if (modalTitle) modalTitle.textContent = 'Cadastrar Nova Peça no Mostruário';
    buildProductFormFields(container, null);
  } else if (adminState.currentModule === 'categorias') {
    if (modalTitle) modalTitle.textContent = 'Cadastrar Nova Categoria';
    buildCategoryFormFields(container, null);
  }

  openCrudModal();
}

function openEditRecordModal(id) {
  adminState.editingRecordId = id;
  adminState.pendingImageFile = null;
  const record = adminState.recordsData.find(r => r.id === id);
  if (!record) return;

  const modalTitle = document.getElementById('crudModalTitle');
  const container = document.getElementById('crudModalFieldsContainer');

  if (adminState.currentModule === 'produtos') {
    if (modalTitle) modalTitle.textContent = `Editar Produto: ${record.nome}`;
    buildProductFormFields(container, record);
  } else if (adminState.currentModule === 'categorias') {
    if (modalTitle) modalTitle.textContent = `Editar Categoria: ${record.nome}`;
    buildCategoryFormFields(container, record);
  }

  openCrudModal();
}

window.openEditRecordModal = openEditRecordModal;

/**
 * Constrói campos para a entidade `produtos`
 * Colunas SQL: nome, descricao, preco, quantidade, id_categoria, id_loja, imagem_url
 */
function buildProductFormFields(container, data) {
  if (!container) return;

  const catOptions = adminState.categoriesData.map(cat => {
    const isSelected = data && Number(data.id_categoria) === Number(cat.id);
    return `<option value="${cat.id}" ${isSelected ? 'selected' : ''}>${escapeHtml(cat.nome)}</option>`;
  }).join('');

  const storeOptions = adminState.storesData.map(st => {
    const isSelected = (data && Number(data.id_loja) === Number(st.id)) || Number(activeLojaId) === Number(st.id);
    return `<option value="${st.id}" ${isSelected ? 'selected' : ''}>${escapeHtml(st.nome)}</option>`;
  }).join('');

  const currentImg = data && data.imagem_url ? data.imagem_url : '';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div class="form-field">
        <label for="field_prod_nome">Nome da Peça *</label>
        <div class="form-input-wrap">
          <i class="fa-solid fa-shirt"></i>
          <input type="text" id="field_prod_nome" value="${data ? escapeHtml(data.nome) : ''}" placeholder="Ex: Camiseta Slim Fit Algodão" required>
        </div>
      </div>

      <!-- Upload de Imagem ou URL -->
      <div class="form-field image-upload-group">
        <label>Foto da Peça de Roupa</label>
        
        <label for="field_prod_file" class="image-upload-zone" style="display: block; cursor: pointer;">
          <input type="file" id="field_prod_file" accept="image/*" style="display: none;">
          <div style="font-size: 1.4rem; color: var(--admin-accent); margin-bottom: 4px;">
            <i class="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">Clique para selecionar imagem do seu dispositivo</div>
          <div style="font-size: 0.725rem; color: var(--text-muted); margin-top: 2px;">Formatos aceitos: JPG, PNG, WEBP (Máx 8MB)</div>
        </label>

        <div style="margin-top: 6px;">
          <label for="field_prod_imagem_url" style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 4px;">Ou insira a URL direta da imagem:</label>
          <input type="url" id="field_prod_imagem_url" class="input-field" style="width: 100%; padding: 8px 12px; border: 1px solid var(--admin-border); border-radius: var(--radius-md); font-size: 0.85rem;" value="${currentImg}" placeholder="https://exemplo.com/foto.jpg">
        </div>

        <div class="image-preview-wrap" id="imagePreviewContainer" style="${currentImg ? 'display: flex;' : 'display: none;'}">
          <img id="preview_prod_img" src="${currentImg}" alt="Pré-visualização" class="image-preview-thumb">
          <div style="flex: 1;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">Pré-visualização ativa</div>
            <div id="imageUploadStatus" style="font-size: 0.725rem; color: var(--success);">Imagem carregada</div>
          </div>
          <button type="button" class="btn-action-sm btn-action-delete" id="btnClearImage" style="padding: 4px 8px;">Remover</button>
        </div>
      </div>

      <div class="form-field">
        <label for="field_prod_desc">Descrição Completa</label>
        <textarea id="field_prod_desc" style="width: 100%; padding: 10px 14px; border: 1px solid var(--admin-border); border-radius: var(--radius-md); font-family: inherit; font-size: 0.875rem; outline: none; min-height: 70px;" placeholder="Detalhes de tecido, caimento e composição...">${data ? escapeHtml(data.descricao || '') : ''}</textarea>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-field">
          <label for="field_prod_preco">Preço Unitário (R$) *</label>
          <div class="form-input-wrap">
            <i class="fa-solid fa-brazilian-real-sign"></i>
            <input type="number" id="field_prod_preco" step="0.01" min="0" value="${data ? data.preco : ''}" placeholder="0.00" required>
          </div>
        </div>

        <div class="form-field">
          <label for="field_prod_qtd">Estoque (Qtd) *</label>
          <div class="form-input-wrap">
            <i class="fa-solid fa-boxes-stacked"></i>
            <input type="number" id="field_prod_qtd" min="0" value="${data ? data.quantidade : '1'}" placeholder="Ex: 50" required>
          </div>
        </div>
      </div>

      <div class="form-field">
        <label for="field_prod_categoria">Categoria de Vestuário *</label>
        <select id="field_prod_categoria" style="width: 100%; padding: 9px 12px; border: 1px solid var(--admin-border); border-radius: var(--radius-md); font-size: 0.875rem; outline: none;" required>
          <option value="">Selecione a categoria...</option>
          ${catOptions}
        </select>
      </div>

      <div class="form-field">
        <label for="field_prod_loja">Loja do Produto *</label>
        <select id="field_prod_loja" style="width: 100%; padding: 9px 12px; border: 1px solid var(--admin-border); border-radius: var(--radius-md); font-size: 0.875rem; outline: none;" required>
          ${storeOptions}
        </select>
      </div>
    </div>
  `;

  // Configuração dos eventos de upload e digitação de URL
  setupImageFieldEvents();
}

function setupImageFieldEvents() {
  const fileInput = document.getElementById('field_prod_file');
  const urlInput = document.getElementById('field_prod_imagem_url');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const previewImg = document.getElementById('preview_prod_img');
  const uploadStatus = document.getElementById('imageUploadStatus');
  const clearBtn = document.getElementById('btnClearImage');

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showAdminToast('Por favor, selecione um arquivo de imagem válido (JPG, PNG ou WEBP).', 'warning');
        return;
      }

      if (file.size > 8 * 1024 * 1024) {
        showAdminToast('Arquivo muito grande. O limite máximo é de 8MB.', 'warning');
        return;
      }

      // Guarda o arquivo em memória para upload no momento em que clicar em "Salvar Registro"
      adminState.pendingImageFile = file;

      // Pré-visualização instantânea no navegador sem escrita no disco do servidor
      const reader = new FileReader();
      reader.onload = (re) => {
        if (previewImg) previewImg.src = re.target.result;
        if (previewContainer) previewContainer.style.display = 'flex';
        if (uploadStatus) {
          uploadStatus.textContent = `Arquivo "${file.name}" selecionado (será salvo ao confirmar)`;
          uploadStatus.style.color = 'var(--admin-accent)';
        }
      };
      reader.readAsDataURL(file);

      showAdminToast('Imagem selecionada! Clique em "Salvar Registro" para gravar.', 'info');
    });
  }

  if (urlInput) {
    urlInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val.length > 5) {
        // Se usuário digitou uma URL direta, descarta arquivo local pendente
        adminState.pendingImageFile = null;
        if (fileInput) fileInput.value = '';
        if (previewImg) previewImg.src = val;
        if (previewContainer) previewContainer.style.display = 'flex';
        if (uploadStatus) {
          uploadStatus.textContent = 'URL personalizada definida';
          uploadStatus.style.color = 'var(--text-main)';
        }
      } else if (!adminState.pendingImageFile) {
        if (previewContainer) previewContainer.style.display = 'none';
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      adminState.pendingImageFile = null;
      if (fileInput) fileInput.value = '';
      if (urlInput) urlInput.value = '';
      if (previewImg) previewImg.src = '';
      if (previewContainer) previewContainer.style.display = 'none';
      if (uploadStatus) uploadStatus.textContent = '';
      showAdminToast('Foto removida.', 'info');
    });
  }
}

/**
 * Constrói campos para a entidade `categorias`
 * Colunas SQL: nome
 */
function buildCategoryFormFields(container, data) {
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div class="form-field">
        <label for="field_cat_nome">Nome da Categoria *</label>
        <div class="form-input-wrap">
          <i class="fa-solid fa-tag"></i>
          <input type="text" id="field_cat_nome" value="${data ? escapeHtml(data.nome) : ''}" placeholder="Ex: Vestidos, Jaquetas, Calças..." required>
        </div>
      </div>
    </div>
  `;
}

function openCrudModal() {
  const overlay = document.getElementById('crudModalOverlay');
  if (overlay) {
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
  }
}

function closeCrudModal() {
  const overlay = document.getElementById('crudModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  }
  adminState.editingRecordId = null;
}

// =============================================================================
// SALVAMENTO SINCRONIZADO COM A API (POST / PUT)
// =============================================================================
async function handleSaveCrudForm(e) {
  e.preventDefault();

  const isEdit = adminState.editingRecordId !== null;
  const saveBtn = document.getElementById('btnSaveCrudModal');

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
  }

  try {
    if (adminState.currentModule === 'produtos') {
      const nome = document.getElementById('field_prod_nome')?.value.trim();
      const descricao = document.getElementById('field_prod_desc')?.value.trim();
      const preco = parseFloat(document.getElementById('field_prod_preco')?.value || '0');
      const quantidade = parseInt(document.getElementById('field_prod_qtd')?.value || '0', 10);
      const id_categoria = parseInt(document.getElementById('field_prod_categoria')?.value || '0', 10);
      const id_loja = parseInt(document.getElementById('field_prod_loja')?.value || activeLojaId, 10);
      let imagem_url = document.getElementById('field_prod_imagem_url')?.value.trim() || null;

      if (!nome || !id_categoria) {
        showAdminToast('Preencha os campos obrigatórios.', 'warning');
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Registro';
        }
        return;
      }

      // Se há um arquivo selecionado pendente, faz o upload no servidor agora
      if (adminState.pendingImageFile) {
        if (saveBtn) {
          saveBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up fa-spin"></i> Enviando imagem...';
        }
        try {
          const formData = new FormData();
          formData.append('imagem', adminState.pendingImageFile);

          const upRes = await fetch(`${ACTIVE_API_BASE}/produtos/upload`, {
            method: 'POST',
            body: formData
          });
          const upData = await upRes.json();
          if (upRes.ok && upData.imagem_url) {
            imagem_url = upData.imagem_url;
          } else {
            throw new Error(upData.mensagem || 'Falha ao salvar a imagem no servidor.');
          }
        } catch (upErr) {
          console.error('Erro ao fazer upload da imagem:', upErr);
          throw new Error('Não foi possível gravar a imagem no servidor. ' + (upErr.message || ''));
        }
      }

      if (saveBtn) {
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando produto...';
      }

      if (isEdit) {
        // PUT /api/produtos/:id
        const res = await fetch(`${ACTIVE_API_BASE}/produtos/${adminState.editingRecordId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, descricao, preco, quantidade, id_categoria, imagem_url })
        });
        const data = await res.json();
        if (res.ok) {
          adminState.pendingImageFile = null;
          showAdminToast(data.mensagem || 'Produto atualizado com sucesso!', 'success');
        } else {
          throw new Error(data.mensagem || 'Falha ao atualizar produto');
        }
      } else {
        // POST /api/produtos/criar
        const res = await fetch(`${ACTIVE_API_BASE}/produtos/criar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome,
            descricao,
            preco,
            quantidade,
            id_categoria,
            id_loja: activeLojaId,
            imagem_url
          })
        });
        const data = await res.json();
        if (res.ok) {
          adminState.pendingImageFile = null;
          showAdminToast(data.mensagem || 'Produto criado com sucesso!', 'success');
        } else {
          throw new Error(data.mensagem || 'Falha ao criar produto');
        }
      }

    } else if (adminState.currentModule === 'categorias') {
      const nome = document.getElementById('field_cat_nome')?.value.trim();
      if (!nome) {
        showAdminToast('Informe o nome da categoria.', 'warning');
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Registro';
        }
        return;
      }

      if (isEdit) {
        // PUT /api/categorias/:id
        const res = await fetch(`${ACTIVE_API_BASE}/categorias/${adminState.editingRecordId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome })
        });
        const data = await res.json();
        if (res.ok) {
          showAdminToast(data.mensagem || 'Categoria atualizada com sucesso!', 'success');
        } else {
          throw new Error(data.mensagem || 'Falha ao atualizar categoria');
        }
      } else {
        // POST /api/categorias/criar
        const res = await fetch(`${ACTIVE_API_BASE}/categorias/criar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome })
        });
        const data = await res.json();
        if (res.ok) {
          showAdminToast(data.messagem || data.mensagem || 'Categoria criada com sucesso!', 'success');
        } else {
          throw new Error(data.mensagem || 'Falha ao criar categoria');
        }
      }
    }

    closeCrudModal();
    await loadInitialAuxiliaryData();
    await loadCurrentModuleData();

  } catch (err) {
    console.error('Erro ao salvar:', err);
    showAdminToast(err.message || 'Erro de comunicação com a API.', 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Registro';
    }
  }
}

// =============================================================================
// EXCLUSÃO SINCRONIZADA (DELETE)
// =============================================================================
function promptDeleteRecord(id, name) {
  adminState.pendingDeleteId = id;
  const overlay = document.getElementById('confirmDeleteModalOverlay');
  const msgEl = document.getElementById('deleteModalMessage');

  if (msgEl) {
    msgEl.innerHTML = `Tem certeza de que deseja remover <strong>"${escapeHtml(name)}"</strong> (ID #${id})?`;
  }

  if (overlay) {
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
  }
}

window.promptDeleteRecord = promptDeleteRecord;

async function executeDeleteRecord() {
  if (!adminState.pendingDeleteId) return;

  const id = adminState.pendingDeleteId;
  const btn = document.getElementById('btnConfirmDelete');
  if (btn) btn.disabled = true;

  try {
    let url = '';
    if (adminState.currentModule === 'produtos') {
      url = `${ACTIVE_API_BASE}/produtos/${id}`;
    } else if (adminState.currentModule === 'categorias') {
      url = `${ACTIVE_API_BASE}/categorias/${id}`;
    }

    const res = await fetch(url, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok) {
      showAdminToast(data.mensagem || 'Registro removido com sucesso!', 'success');
      closeDeleteModal();
      await loadInitialAuxiliaryData();
      await loadCurrentModuleData();
    } else {
      throw new Error(data.mensagem || 'Não foi possível excluir o registro.');
    }
  } catch (err) {
    console.error('Erro ao excluir:', err);
    showAdminToast(err.message || 'Erro ao comunicar com a API.', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

function closeDeleteModal() {
  const overlay = document.getElementById('confirmDeleteModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  }
  adminState.pendingDeleteId = null;
}

// =============================================================================
// EVENTOS & INTERFACE
// =============================================================================
function setupEventListeners() {
  // Logout
  const logoutBtn = document.getElementById('btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('admin_user');
      sessionStorage.removeItem('admin_user');
      window.location.href = 'login.html';
    });
  }

  // Abrir modal de criação no canto superior direito
  const openCreateBtn = document.getElementById('btnOpenCreateModal');
  if (openCreateBtn) openCreateBtn.addEventListener('click', openCreateRecordModal);

  // Fechar modal CRUD
  const closeCrudBtn = document.getElementById('btnCloseCrudModal');
  const cancelCrudBtn = document.getElementById('btnCancelCrudModal');
  if (closeCrudBtn) closeCrudBtn.addEventListener('click', closeCrudModal);
  if (cancelCrudBtn) cancelCrudBtn.addEventListener('click', closeCrudModal);

  // Submeter formulário CRUD
  const crudForm = document.getElementById('crudDynamicForm');
  if (crudForm) crudForm.addEventListener('submit', handleSaveCrudForm);

  // Modal de Exclusão
  const closeDelBtn = document.getElementById('btnCloseDeleteModal');
  const cancelDelBtn = document.getElementById('btnCancelDelete');
  const confirmDelBtn = document.getElementById('btnConfirmDelete');
  if (closeDelBtn) closeDelBtn.addEventListener('click', closeDeleteModal);
  if (cancelDelBtn) cancelDelBtn.addEventListener('click', closeDeleteModal);
  if (confirmDelBtn) confirmDelBtn.addEventListener('click', executeDeleteRecord);

  // Filtro de Busca na Tabela Simples (Categorias e Lojas)
  const searchInput = document.getElementById('tableSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      const filtered = adminState.recordsData.filter(record => {
        return Object.values(record).some(val => 
          String(val).toLowerCase().includes(term)
        );
      });
      renderTable(filtered);
    });
  }

  // Inicializa Filtros da Página de Produtos no Dashboard
  setupAdminProductFilterEvents();
}

// =============================================================================
// FILTROS AVANÇADOS DA PÁGINA DE PRODUTOS NO DASHBOARD
// =============================================================================
const adminFiltersState = {
  texto: '',
  categoria: '',
  precoMin: '',
  precoMax: '',
  qtdMin: '',
  qtdMax: ''
};

function populateAdminCategoryFilter() {
  const select = document.getElementById('adminFilterCategoria');
  if (!select) return;

  select.innerHTML = '<option value="">Todas as Categorias</option>';
  adminState.categoriesData.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.nome;
    opt.textContent = cat.nome;
    select.appendChild(opt);
  });
}

function setupAdminProductFilterEvents() {
  const textoInput = document.getElementById('adminFilterTexto');
  const catSelect = document.getElementById('adminFilterCategoria');
  const precoMinInput = document.getElementById('adminFilterPrecoMin');
  const precoMaxInput = document.getElementById('adminFilterPrecoMax');
  const qtdMinInput = document.getElementById('adminFilterQtdMin');
  const qtdMaxInput = document.getElementById('adminFilterQtdMax');
  const resetBtn = document.getElementById('btnAdminResetFilters');
  const quickPills = document.querySelectorAll('.admin-quick-pill');

  let adminDebounceTimer = null;

  if (textoInput) {
    textoInput.addEventListener('input', (e) => {
      clearTimeout(adminDebounceTimer);
      adminFiltersState.texto = e.target.value.trim();
      adminDebounceTimer = setTimeout(() => {
        applyAdminProductFilters();
      }, 250);
    });
  }

  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      adminFiltersState.categoria = e.target.value;
      applyAdminProductFilters();
    });
  }

  [precoMinInput, precoMaxInput, qtdMinInput, qtdMaxInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        adminFiltersState.precoMin = precoMinInput?.value || '';
        adminFiltersState.precoMax = precoMaxInput?.value || '';
        adminFiltersState.qtdMin = qtdMinInput?.value || '';
        adminFiltersState.qtdMax = qtdMaxInput?.value || '';
        applyAdminProductFilters();
      });
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', resetAdminProductFilters);
  }

  // Atalhos Rápidos (Chips)
  quickPills.forEach(pill => {
    pill.addEventListener('click', () => {
      quickPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const action = pill.getAttribute('data-quick');
      applyQuickProductFilter(action);
    });
  });
}

function applyAdminProductFilters() {
  if (adminState.currentModule !== 'produtos') return;

  const { texto, categoria, precoMin, precoMax, qtdMin, qtdMax } = adminFiltersState;

  const filtered = adminState.recordsData.filter(prod => {
    // 1. Busca por nome ou descrição
    if (texto) {
      const t = texto.toLowerCase();
      const matchNome = (prod.nome || '').toLowerCase().includes(t);
      const matchDesc = (prod.descricao || '').toLowerCase().includes(t);
      if (!matchNome && !matchDesc) return false;
    }

    // 2. Filtro de categoria
    if (categoria) {
      const catNome = (prod.nome_categoria || '').toLowerCase();
      if (catNome !== categoria.toLowerCase()) return false;
    }

    // 3. Faixa de Preço
    if (precoMin !== '' && !isNaN(Number(precoMin))) {
      if (Number(prod.preco) < Number(precoMin)) return false;
    }
    if (precoMax !== '' && !isNaN(Number(precoMax))) {
      if (Number(prod.preco) > Number(precoMax)) return false;
    }

    // 4. Faixa de Estoque
    if (qtdMin !== '' && !isNaN(Number(qtdMin))) {
      if (Number(prod.quantidade) < Number(qtdMin)) return false;
    }
    if (qtdMax !== '' && !isNaN(Number(qtdMax))) {
      if (Number(prod.quantidade) > Number(qtdMax)) return false;
    }

    return true;
  });

  renderTable(filtered);
}

function resetAdminProductFilters() {
  adminFiltersState.texto = '';
  adminFiltersState.categoria = '';
  adminFiltersState.precoMin = '';
  adminFiltersState.precoMax = '';
  adminFiltersState.qtdMin = '';
  adminFiltersState.qtdMax = '';

  const form = document.getElementById('adminFiltersForm');
  if (form) form.reset();

  document.querySelectorAll('.admin-quick-pill').forEach(p => {
    if (p.getAttribute('data-quick') === 'all') p.classList.add('active');
    else p.classList.remove('active');
  });

  applyAdminProductFilters();
}

function applyQuickProductFilter(type) {
  resetAdminProductFilters();

  if (type === 'low-stock') {
    adminFiltersState.qtdMax = '40';
    const qtdMaxInput = document.getElementById('adminFilterQtdMax');
    if (qtdMaxInput) qtdMaxInput.value = '40';
  } else if (type === 'out-stock') {
    adminFiltersState.qtdMax = '0';
    const qtdMaxInput = document.getElementById('adminFilterQtdMax');
    if (qtdMaxInput) qtdMaxInput.value = '0';
  } else if (type === 'premium') {
    adminFiltersState.precoMin = '150';
    const precoMinInput = document.getElementById('adminFilterPrecoMin');
    if (precoMinInput) precoMinInput.value = '150';
  }

  // Mantém a pílula clicada ativa
  document.querySelectorAll('.admin-quick-pill').forEach(p => {
    if (p.getAttribute('data-quick') === type) p.classList.add('active');
    else p.classList.remove('active');
  });

  applyAdminProductFilters();
}

// =============================================================================
// UTILITÁRIOS & TOASTS
// =============================================================================
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showAdminToast(message, type = 'info') {
  const container = document.getElementById('adminToastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 18px;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 600;
    box-shadow: var(--shadow-lg);
    background: ${type === 'success' ? '#14532d' : type === 'error' ? '#7f1d1d' : '#18181b'};
    color: #ffffff;
    border-left: 4px solid ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#c29b38'};
    animation: fadeIn 0.2s ease;
  `;

  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-xmark';
  if (type === 'warning') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

