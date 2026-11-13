/**
 * MOSTRUÁRIO OFICIAL - JAVASCRIPT PRINCIPAL (HIGH-END FASHION E-COMMERCE TIER 1)
 * Inspirado nas melhores experiências de moda (Zara, Nike, ASOS, Farfetch)
 * 
 * Funcionalidades:
 * - Vitrine Dinâmica Integrada à API e MySQL
 * - Seletor de Lojas em Tempo Real
 * - Ticker de Notificações e Benefícios Rotativo
 * - Navegação Rápida por Pílulas de Categoria (Pills Bar)
 * - Ordenação Inteligente (Destaques, Preço, Estoque, Alfabética)
 * - Sistema Completo de Favoritos (Wishlist) persistido em localStorage
 * - Seletor de Tamanhos (P, M, G, GG, XG) com Guia de Medidas Oficial
 * - Sacola de Compras com Barra de Progresso de Frete Grátis (R$ 199)
 * - Sistema Real de Cupons de Desconto (PRIMEIRACOMPRA, FASHION15, VIP20)
 * - Checkout Estruturado via WhatsApp com Tamanhos, Desconto e Destino (+5527992036558)
 * - Scroll Lock Suave na Sacola e no Modal
 * - Light e Dark Mode
 */

// =============================================================================
// CONFIGURAÇÕES GLOBAIS E CONSTANTES
// =============================================================================
const WHATSAPP_NUMBER = '5527992036558';
const DEFAULT_STORE_ID = 1;
const FREE_SHIPPING_THRESHOLD = 199.00; // R$ 199 para Frete Grátis

// Cupons promocionais aceitos
const PROMO_COUPONS = {
  'PRIMEIRACOMPRA': 10,
  'FASHION15': 15,
  'VIP20': 20,
  'VERAO10': 10
};

// Bases da API para detecção automática
const API_CANDIDATES = [
  'http://localhost:3000/api',
  'http://localhost:3333/api',
  '/api'
];

let ACTIVE_API_BASE = localStorage.getItem('mostruario_api_base') || API_CANDIDATES[0];
const urlLojaParam = new URLSearchParams(window.location.search).get('loja');
let activeLojaId = parseInt(urlLojaParam || localStorage.getItem('mostruario_loja_id') || DEFAULT_STORE_ID, 10);

// Fallbacks de imagens por categoria caso o produto ainda não tenha imagem_url cadastrada
const CLOTHING_IMAGE_MAP = {
  'camisetas': [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80'
  ],
  'polo': [
    'https://images.unsplash.com/photo-1625910513413-7223b9d0e2e5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?auto=format&fit=crop&w=600&q=80'
  ],
  'bermudas': [
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=600&q=80'
  ],
  'tênis': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80'
  ],
  'meias': [
    'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?auto=format&fit=crop&w=600&q=80'
  ],
  'cuecas': [
    'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'
  ],
  'jaquetas': [
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=600&q=80'
  ],
  'vestidos': [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80'
  ],
  'calças': [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80'
  ],
  'default': [
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80'
  ]
};

function getProductImageUrl(produto) {
  if (produto.imagem_url && produto.imagem_url.trim().length > 3) {
    return produto.imagem_url;
  }
  const nomeLower = (produto.nome || '').toLowerCase();
  const catLower = (produto.nome_categoria || '').toLowerCase();

  for (const [key, urls] of Object.entries(CLOTHING_IMAGE_MAP)) {
    if (key !== 'default' && (nomeLower.includes(key) || catLower.includes(key))) {
      const idx = Math.abs((produto.id || 1)) % urls.length;
      return urls[idx];
    }
  }
  const defaultList = CLOTHING_IMAGE_MAP['default'];
  return defaultList[Math.abs((produto.id || 1)) % defaultList.length];
}

// =============================================================================
// ESTADO DA APLICAÇÃO
// =============================================================================
const state = {
  currentStore: null,
  allStores: [],
  categories: [],
  products: [],
  favorites: [],
  currentSort: 'featured',
  activeQuickCategory: '',
  selectedSize: 'M',
  activeCoupon: null, // { code: 'PRIMEIRACOMPRA', discountPct: 10 }
  filters: {
    texto: '',
    categoria: '',
    precoMin: '',
    precoMax: '',
    qtdMin: '',
    qtdMax: ''
  },
  cart: [],
  currentModalProduct: null,
  currentModalQuantity: 1,
  isLoading: false
};

// =============================================================================
// INICIALIZAÇÃO
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initFavorites();
  initCart();
  initNoticeTicker();
  checkApiAndInitialize();
  setupFilterEvents();
  setupQuickNavPills();
  setupModalEvents();
  setupSizeGuideModalEvents();
  setupCartEvents();
});

// =============================================================================
// TICKER ROTATIVO DE BENEFÍCIOS (ZARA / FARFETCH STYLE)
// =============================================================================
function initNoticeTicker() {
  const ticker = document.getElementById('noticeTicker');
  if (!ticker) return;

  const items = ticker.querySelectorAll('.ticker-item');
  if (items.length <= 1) return;

  let currentIdx = 0;
  setInterval(() => {
    items[currentIdx].classList.remove('active');
    currentIdx = (currentIdx + 1) % items.length;
    items[currentIdx].classList.add('active');
  }, 4000);
}

// =============================================================================
// SISTEMA DE FAVORITOS (WISHLIST) PERSISTIDO
// =============================================================================
function initFavorites() {
  try {
    const saved = localStorage.getItem('mostruario_favoritos');
    state.favorites = saved ? JSON.parse(saved) : [];
  } catch (e) {
    state.favorites = [];
  }
  updateFavoritesBadges();

  const openWishlistBtn = document.getElementById('openWishlistBtn');
  if (openWishlistBtn) {
    openWishlistBtn.addEventListener('click', toggleWishlistFilter);
  }
}

function saveFavorites() {
  localStorage.setItem('mostruario_favoritos', JSON.stringify(state.favorites));
  updateFavoritesBadges();
}

function isFavorite(productId) {
  return state.favorites.includes(Number(productId));
}

function toggleFavorite(productId) {
  const idNum = Number(productId);
  const idx = state.favorites.indexOf(idNum);

  if (idx >= 0) {
    state.favorites.splice(idx, 1);
    showToast('Peça removida dos seus favoritos.', 'info');
  } else {
    state.favorites.push(idNum);
    showToast('Adicionado aos Favoritos! ❤️', 'success');
  }

  saveFavorites();

  // Atualiza botões de favoritar visíveis na tela
  document.querySelectorAll(`.card-fav-id-${idNum}`).forEach(btn => {
    btn.classList.toggle('active', isFavorite(idNum));
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isFavorite(idNum) ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    }
  });

  // Atualiza modal se estiver aberto com esse produto
  if (state.currentModalProduct && Number(state.currentModalProduct.id) === idNum) {
    const modalFavBtn = document.getElementById('modalFavToggleBtn');
    if (modalFavBtn) {
      modalFavBtn.classList.toggle('active', isFavorite(idNum));
      const mIcon = modalFavBtn.querySelector('i');
      if (mIcon) {
        mIcon.className = isFavorite(idNum) ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      }
    }
  }

  // Se o filtro ativo for de favoritos, re-renderiza
  if (state.activeQuickCategory === '__favorites__') {
    renderFilteredCatalog();
  }
}

function updateFavoritesBadges() {
  const count = state.favorites.length;
  const headerBadge = document.getElementById('wishlistCountBadge');
  const pillCount = document.getElementById('pillFavCount');
  const headerIcon = document.getElementById('wishlistHeaderIcon');

  if (headerBadge) {
    headerBadge.textContent = count;
    headerBadge.style.display = count > 0 ? 'flex' : 'none';
  }
  if (pillCount) {
    pillCount.textContent = count;
  }
  if (headerIcon) {
    headerIcon.className = count > 0 ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    if (count > 0) headerIcon.style.color = '#ef4444';
    else headerIcon.style.color = '';
  }
}

function toggleWishlistFilter() {
  if (state.activeQuickCategory === '__favorites__') {
    state.activeQuickCategory = '';
    renderFilteredCatalog();
    showToast('Exibindo catálogo completo.', 'info');
  } else {
    if (state.favorites.length === 0) {
      showToast('Você ainda não favoritou nenhuma peça. Clique no coração ❤️ para salvar!', 'warning');
      return;
    }
    state.activeQuickCategory = '__favorites__';
    renderFilteredCatalog();
    showToast(`Mostrando suas ${state.favorites.length} peças favoritas!`, 'success');
  }
  updatePillsActiveState();
}

window.toggleFavorite = toggleFavorite;

// =============================================================================
// GERENCIAMENTO DE TEMA (LIGHT & DARK MODE)
// =============================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('mostruario_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  applyTheme(savedTheme);

  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      showToast(`Modo ${nextTheme === 'dark' ? 'Escuro' : 'Claro'} ativado.`, 'info');
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('mostruario_theme', theme);

  const icon = document.getElementById('themeToggleIcon');
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

// =============================================================================
// INICIALIZAÇÃO DE DADOS & API
// =============================================================================
async function checkApiAndInitialize() {
  setLoading(true);
  let workingBase = null;

  for (const candidate of API_CANDIDATES) {
    try {
      const res = await fetch(`${candidate}/categorias`, { method: 'GET' });
      if (res.ok) {
        workingBase = candidate;
        break;
      }
    } catch (e) {
      // continua tentando
    }
  }

  if (workingBase) {
    ACTIVE_API_BASE = workingBase;
    localStorage.setItem('mostruario_api_base', ACTIVE_API_BASE);
  }

  await loadStoresAndSetupSwitcher();
  await loadCategories();
  await fetchProductsServerSide();
}

async function loadStoresAndSetupSwitcher() {
  const selectEl = document.getElementById('storeSelector');

  try {
    const res = await fetch(`${ACTIVE_API_BASE}/lojas`);
    if (res.ok) {
      const data = await res.json();
      const stores = data.lojas || data;
      state.allStores = Array.isArray(stores) ? stores : [];

      if (state.allStores.length > 0) {
        const found = state.allStores.find(s => s.id === activeLojaId);
        state.currentStore = found || state.allStores[0];
        activeLojaId = state.currentStore.id;
        localStorage.setItem('mostruario_loja_id', activeLojaId);

        if (selectEl) {
          selectEl.innerHTML = '';
          state.allStores.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `🏪 ${s.nome}`;
            if (s.id === activeLojaId) opt.selected = true;
            selectEl.appendChild(opt);
          });
        }
      }
    }
  } catch (e) {
    console.warn('Não foi possível carregar lista de lojas via API:', e);
  }

  if (!state.currentStore) {
    state.currentStore = {
      id: activeLojaId,
      nome: activeLojaId === 3 ? 'Fecomercio Moda' : 'Senac Moda',
      descricao: 'Mostruário Oficial de Coleções'
    };
  }

  applyStoreBranding(state.currentStore);

  if (selectEl) {
    selectEl.addEventListener('change', (e) => {
      const newId = parseInt(e.target.value, 10);
      switchStore(newId);
    });
  }
}

function applyStoreBranding(store) {
  const pageTitleEl = document.getElementById('htmlPageTitle');
  const storeTitleEl = document.getElementById('pageStoreTitle');
  const storeSubtitleEl = document.getElementById('pageStoreSubtitle');
  const heroHeadlineEl = document.getElementById('heroStoreHeadline');
  const footerTitleEl = document.getElementById('footerStoreTitle');
  const footerCopyrightEl = document.getElementById('footerCopyrightStoreName');
  const storeLogoImg = document.getElementById('storeLogoImg');
  const storeLogoFallback = document.getElementById('storeLogoFallback');
  const footerLogoImg = document.getElementById('footerStoreLogoImg');
  const footerLogoFallback = document.getElementById('footerStoreLogoFallback');

  const storeName = store ? store.nome : 'Mostruário';

  if (pageTitleEl) pageTitleEl.textContent = `${storeName} | Mostruário Oficial & Coleções`;
  if (storeTitleEl) storeTitleEl.textContent = storeName;
  if (storeSubtitleEl) storeSubtitleEl.textContent = 'Coleção de Roupas & Acessórios';
  if (heroHeadlineEl) heroHeadlineEl.textContent = `${storeName} - Coleção de Roupas`;
  if (footerTitleEl) footerTitleEl.textContent = storeName;
  if (footerCopyrightEl) footerCopyrightEl.textContent = storeName;

  const initial = storeName.charAt(0).toUpperCase();

  if (store && store.logo_url) {
    if (storeLogoImg) {
      storeLogoImg.src = store.logo_url;
      storeLogoImg.style.display = 'block';
    }
    if (storeLogoFallback) storeLogoFallback.style.display = 'none';

    if (footerLogoImg) {
      footerLogoImg.src = store.logo_url;
      footerLogoImg.style.display = 'block';
    }
    if (footerLogoFallback) footerLogoFallback.style.display = 'none';
  } else {
    if (storeLogoImg) storeLogoImg.style.display = 'none';
    if (storeLogoFallback) {
      storeLogoFallback.textContent = initial;
      storeLogoFallback.style.display = 'flex';
    }

    if (footerLogoImg) footerLogoImg.style.display = 'none';
    if (footerLogoFallback) {
      footerLogoFallback.textContent = initial;
      footerLogoFallback.style.display = 'flex';
    }
  }
}

async function switchStore(newLojaId) {
  activeLojaId = newLojaId;
  localStorage.setItem('mostruario_loja_id', activeLojaId);

  const found = state.allStores.find(s => s.id === activeLojaId);
  if (found) {
    state.currentStore = found;
  } else {
    state.currentStore = {
      id: activeLojaId,
      nome: activeLojaId === 3 ? 'Fecomercio' : 'Senac Moda'
    };
  }

  applyStoreBranding(state.currentStore);
  showToast(`Loja alterada para: ${state.currentStore.nome}`, 'info');

  await fetchProductsServerSide();
}

async function loadCategories() {
  const catSelect = document.getElementById('filterCategoria');
  if (!catSelect) return;

  try {
    const res = await fetch(`${ACTIVE_API_BASE}/categorias`);
    if (res.ok) {
      const data = await res.json();
      state.categories = Array.isArray(data) ? data : (data.categorias || []);

      catSelect.innerHTML = '<option value="">Todas as Categorias</option>';
      state.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.nome;
        opt.textContent = cat.nome;
        catSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.warn('Erro ao carregar categorias dinâmicas:', err);
  }
}

// =============================================================================
// NAVEGAÇÃO RÁPIDA POR PÍLULAS (PILLS BAR - ASOS / GYMSHARK STYLE)
// =============================================================================
function setupQuickNavPills() {
  const container = document.getElementById('quickNavPillsContainer');
  if (!container) return;

  const pills = container.querySelectorAll('.quick-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.getAttribute('data-category');

      if (pill.id === 'pillShowFavorites') {
        toggleWishlistFilter();
        return;
      }

      if (pill.id === 'pillShowPromo') {
        state.activeQuickCategory = '__promo__';
        renderFilteredCatalog();
        updatePillsActiveState();
        showToast('Exibindo destaques e ofertas especiais!', 'info');
        return;
      }

      state.activeQuickCategory = cat || '';
      // Sincroniza também com o select de filtro
      const catSelect = document.getElementById('filterCategoria');
      if (catSelect) catSelect.value = state.activeQuickCategory;
      state.filters.categoria = state.activeQuickCategory;

      fetchProductsServerSide();
      updatePillsActiveState();
    });
  });
}

function updatePillsActiveState() {
  const container = document.getElementById('quickNavPillsContainer');
  if (!container) return;

  container.querySelectorAll('.quick-pill').forEach(pill => {
    pill.classList.remove('active');
    const cat = pill.getAttribute('data-category');

    if (state.activeQuickCategory === '__favorites__' && pill.id === 'pillShowFavorites') {
      pill.classList.add('active');
    } else if (state.activeQuickCategory === '__promo__' && pill.id === 'pillShowPromo') {
      pill.classList.add('active');
    } else if (state.activeQuickCategory === cat && !pill.id.startsWith('pillShow')) {
      pill.classList.add('active');
    }
  });
}

// =============================================================================
// FILTROS & ORDENAÇÃO DINÂMICA
// =============================================================================
function setupFilterEvents() {
  const applyBtn = document.getElementById('applyFiltersBtn');
  const resetBtn = document.getElementById('resetFiltersBtn');
  const emptyResetBtn = document.getElementById('emptyStateResetBtn');
  const sortSelector = document.getElementById('catalogSortSelector');

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      updateFilterValuesFromInputs();
      fetchProductsServerSide();
    });
  }

  const inputs = ['filterTexto', 'filterCategoria', 'filterPrecoMin', 'filterPrecoMax', 'filterQtdMin', 'filterQtdMax'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          updateFilterValuesFromInputs();
          fetchProductsServerSide();
        }
      });
      if (id === 'filterCategoria') {
        el.addEventListener('change', () => {
          updateFilterValuesFromInputs();
          state.activeQuickCategory = state.filters.categoria;
          updatePillsActiveState();
          fetchProductsServerSide();
        });
      }
    }
  });

  if (sortSelector) {
    sortSelector.addEventListener('change', (e) => {
      state.currentSort = e.target.value;
      renderFilteredCatalog();
      showToast(`Catálogo ordenado por: ${sortSelector.options[sortSelector.selectedIndex].text}`, 'info');
    });
  }

  if (resetBtn) resetBtn.addEventListener('click', resetFilters);
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetFilters);
}

function updateFilterValuesFromInputs() {
  state.filters.texto = document.getElementById('filterTexto')?.value.trim() || '';
  state.filters.categoria = document.getElementById('filterCategoria')?.value || '';
  state.filters.precoMin = document.getElementById('filterPrecoMin')?.value || '';
  state.filters.precoMax = document.getElementById('filterPrecoMax')?.value || '';
  state.filters.qtdMin = document.getElementById('filterQtdMin')?.value || '';
  state.filters.qtdMax = document.getElementById('filterQtdMax')?.value || '';
}

function resetFilters() {
  state.filters = {
    texto: '',
    categoria: '',
    precoMin: '',
    precoMax: '',
    qtdMin: '',
    qtdMax: ''
  };
  state.activeQuickCategory = '';
  state.currentSort = 'featured';

  const form = document.getElementById('filtersForm');
  if (form) form.reset();

  const sortSelect = document.getElementById('catalogSortSelector');
  if (sortSelect) sortSelect.value = 'featured';

  updatePillsActiveState();
  fetchProductsServerSide();
}

async function fetchProductsServerSide() {
  setLoading(true);

  const params = new URLSearchParams();
  if (state.filters.texto) params.append('texto', state.filters.texto);
  if (state.filters.categoria) params.append('categoria', state.filters.categoria);
  if (state.filters.precoMin) params.append('precoMin', state.filters.precoMin);
  if (state.filters.precoMax) params.append('precoMax', state.filters.precoMax);
  if (state.filters.qtdMin) params.append('qtdMin', state.filters.qtdMin);
  if (state.filters.qtdMax) params.append('qtdMax', state.filters.qtdMax);

  const queryString = params.toString();
  const url = `${ACTIVE_API_BASE}/produtos/loja/${activeLojaId}${queryString ? '?' + queryString : ''}`;

  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      state.products = data.produtos || [];
      renderFilteredCatalog();
      updateFilterSummary();
    } else {
      state.products = [];
      renderFilteredCatalog();
      updateFilterSummary();
    }
  } catch (err) {
    console.error('Falha ao conectar com endpoint de produtos:', err);
    state.products = [];
    renderFilteredCatalog();
    updateFilterSummary();
  } finally {
    setLoading(false);
  }
}

function renderFilteredCatalog() {
  let list = [...state.products];

  // Filtro extra de Favoritos
  if (state.activeQuickCategory === '__favorites__') {
    list = list.filter(p => isFavorite(p.id));
  } else if (state.activeQuickCategory === '__promo__') {
    list = list.filter(p => (p.id % 2 === 0) || p.quantidade < 50);
  }

  // Ordenação
  if (state.currentSort === 'price_asc') {
    list.sort((a, b) => Number(a.preco) - Number(b.preco));
  } else if (state.currentSort === 'price_desc') {
    list.sort((a, b) => Number(b.preco) - Number(a.preco));
  } else if (state.currentSort === 'stock_desc') {
    list.sort((a, b) => Number(b.quantidade) - Number(a.quantidade));
  } else if (state.currentSort === 'name_asc') {
    list.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  renderCatalogByCategory(list);
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  const indicator = document.getElementById('catalogLoading');
  if (indicator) {
    if (isLoading) indicator.classList.add('active');
    else indicator.classList.remove('active');
  }
}

function updateFilterSummary() {
  const totalCountEl = document.getElementById('totalProductsCount');
  if (totalCountEl) totalCountEl.textContent = state.products.length;

  const pillsContainer = document.getElementById('activeFilterPills');
  if (!pillsContainer) return;
  pillsContainer.innerHTML = '';

  const activeEntries = Object.entries(state.filters).filter(([k, v]) => v !== '');
  activeEntries.forEach(([key, val]) => {
    let label = '';
    if (key === 'texto') label = `Busca: "${val}"`;
    else if (key === 'categoria') label = `Categoria: ${val}`;
    else if (key === 'precoMin') label = `Preço ≥ R$${val}`;
    else if (key === 'precoMax') label = `Preço ≤ R$${val}`;
    else if (key === 'qtdMin') label = `Qtd ≥ ${val}`;
    else if (key === 'qtdMax') label = `Qtd ≤ ${val}`;

    const pill = document.createElement('span');
    pill.className = 'filter-pill';
    pill.innerHTML = `
      ${label}
      <button type="button" aria-label="Remover filtro" onclick="removeSingleFilter('${key}')">&times;</button>
    `;
    pillsContainer.appendChild(pill);
  });
}

window.removeSingleFilter = function(key) {
  state.filters[key] = '';
  const inputMap = {
    texto: 'filterTexto',
    categoria: 'filterCategoria',
    precoMin: 'filterPrecoMin',
    precoMax: 'filterPrecoMax',
    qtdMin: 'filterQtdMin',
    qtdMax: 'filterQtdMax'
  };
  const el = document.getElementById(inputMap[key]);
  if (el) el.value = '';
  fetchProductsServerSide();
};

// =============================================================================
// RENDERIZAÇÃO POR CATEGORIA COM SCROLL SUAVE & CARDS PREMIUM
// =============================================================================
function renderCatalogByCategory(products) {
  const container = document.getElementById('categoriesContainer');
  const emptyState = document.getElementById('emptyState');
  if (!container) return;

  container.innerHTML = '';

  if (!products || products.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  const groups = {};
  products.forEach(prod => {
    const catName = prod.nome_categoria || 'Outras Peças';
    if (!groups[catName]) {
      groups[catName] = [];
    }
    groups[catName].push(prod);
  });

  Object.entries(groups).forEach(([categoryName, prodsList], sectionIdx) => {
    const section = document.createElement('section');
    section.className = 'category-section';

    const sectionId = `scrollRow_${sectionIdx}`;

    section.innerHTML = `
      <div class="category-header">
        <div class="category-title-wrap">
          <h2 class="category-title">${escapeHtml(categoryName)}</h2>
          <span class="category-count">${prodsList.length} item(ns)</span>
        </div>
        <div class="scroll-controls">
          <button type="button" class="scroll-arrow" aria-label="Página anterior de produtos" onclick="scrollCategoryGrid('${sectionId}', -1)">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <button type="button" class="scroll-arrow" aria-label="Próxima página de produtos" onclick="scrollCategoryGrid('${sectionId}', 1)">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div class="horizontal-scroll-container" id="${sectionId}">
        <!-- Cards compactos e sofisticados -->
      </div>
    `;

    const rowContainer = section.querySelector(`#${sectionId}`);

    prodsList.forEach(prod => {
      const card = createProductCardElement(prod);
      rowContainer.appendChild(card);
    });

    container.appendChild(section);
  });
}

/**
 * Rola uma página inteira de produtos de forma suave (cardStep = 231px)
 */
window.scrollCategoryGrid = function(containerId, directionOrDistance) {
  const el = document.getElementById(containerId);
  if (!el) return;

  let distance = 0;
  if (Math.abs(directionOrDistance) <= 2) {
    const direction = directionOrDistance < 0 ? -1 : 1;
    const cardStep = 231; // 215px card + 16px gap
    const visibleCards = Math.max(1, Math.floor((el.clientWidth + 16) / cardStep));
    const cardsToScroll = visibleCards > 1 ? visibleCards : 1;
    distance = direction * (cardsToScroll * cardStep);
  } else {
    distance = directionOrDistance;
  }

  el.scrollBy({
    left: distance,
    behavior: 'smooth'
  });
};

function createProductCardElement(produto) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.tabIndex = 0;

  const imageUrl = getProductImageUrl(produto);
  const formattedPrice = formatCurrency(produto.preco);
  const stockText = produto.quantidade > 0 ? `${produto.quantidade} un.` : 'Esgotado';
  const stockClass = produto.quantidade > 0 ? 'stock-in' : 'stock-out';
  const isFav = isFavorite(produto.id);

  // Badge de Promoção ou Lançamento estilizado
  let promoTag = '';
  if (produto.id % 3 === 0) {
    promoTag = `<span class="product-badge-promo">-15% OFF</span>`;
  } else if (produto.quantidade < 15 && produto.quantidade > 0) {
    promoTag = `<span class="product-badge-promo" style="background: #f59e0b;">Restam Poucos</span>`;
  }

  card.innerHTML = `
    <div class="product-image-wrap">
      <img src="${imageUrl}" alt="${escapeHtml(produto.nome)}" class="product-img" loading="lazy">
      ${promoTag}
      <button type="button" class="product-fav-btn card-fav-id-${produto.id} ${isFav ? 'active' : ''}" title="${isFav ? 'Remover dos favoritos' : 'Favoritar peça'}" onclick="event.stopPropagation(); toggleFavorite(${produto.id})">
        <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
      </button>
      <span class="product-badge-category">${escapeHtml(produto.nome_categoria || 'Moda')}</span>
      <span class="product-badge-stock ${stockClass}">${stockText}</span>
    </div>
    <div class="product-body">
      <h3 class="product-title" title="${escapeHtml(produto.nome)}">${escapeHtml(produto.nome)}</h3>
      <p class="product-desc" title="${escapeHtml(produto.descricao || '')}">
        ${escapeHtml(produto.descricao || 'Peça com caimento refinado e tecido premium.')}
      </p>
      <div class="product-footer">
        <div class="product-price-block">
          <span class="price-label">Preço</span>
          <span class="product-price">${formattedPrice}</span>
          <span style="font-size: 0.65rem; color: var(--text-muted); display: block;">ou 6x sem juros</span>
        </div>
        <button type="button" class="btn-card-add" title="Ver detalhes & tamanhos" aria-label="Ver detalhes">
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    openProductDetailsModal(produto);
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProductDetailsModal(produto);
    }
  });

  return card;
}

// =============================================================================
// MODAL DE DETALHES DO PRODUTO (SHOWROOM DE MODA DE LUXO)
// =============================================================================
function setupModalEvents() {
  const modal = document.getElementById('productModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const decBtn = document.getElementById('decreaseQtyBtn');
  const incBtn = document.getElementById('increaseQtyBtn');
  const addCartBtn = document.getElementById('modalAddToCartBtn');
  const directWppBtn = document.getElementById('modalDirectWhatsAppBtn');
  const modalFavBtn = document.getElementById('modalFavToggleBtn');
  const sizeChipsContainer = document.getElementById('modalSizeChips');

  if (closeBtn) closeBtn.addEventListener('click', closeProductModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeProductModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeCartDrawer();
      closeSizeGuideModal();
    }
  });

  if (decBtn) {
    decBtn.addEventListener('click', () => {
      if (state.currentModalQuantity > 1) {
        state.currentModalQuantity--;
        updateModalQuantityInput();
      }
    });
  }

  if (incBtn) {
    incBtn.addEventListener('click', () => {
      const maxAvailable = state.currentModalProduct ? state.currentModalProduct.quantidade : 99;
      if (state.currentModalQuantity < maxAvailable) {
        state.currentModalQuantity++;
        updateModalQuantityInput();
      } else {
        showToast(`Limite máximo disponível em estoque: ${maxAvailable}`, 'warning');
      }
    });
  }

  if (sizeChipsContainer) {
    sizeChipsContainer.querySelectorAll('.size-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        sizeChipsContainer.querySelectorAll('.size-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.selectedSize = chip.getAttribute('data-size') || 'M';
      });
    });
  }

  if (modalFavBtn) {
    modalFavBtn.addEventListener('click', () => {
      if (state.currentModalProduct) {
        toggleFavorite(state.currentModalProduct.id);
      }
    });
  }

  if (addCartBtn) {
    addCartBtn.addEventListener('click', () => {
      if (!state.currentModalProduct) return;
      addToCart(state.currentModalProduct, state.currentModalQuantity, state.selectedSize);
      closeProductModal();
      openCartDrawer();
    });
  }

  if (directWppBtn) {
    directWppBtn.addEventListener('click', () => {
      if (!state.currentModalProduct) return;
      const prod = state.currentModalProduct;
      const size = state.selectedSize || 'M';
      const storeName = state.currentStore ? state.currentStore.nome : 'Mostruário';

      let msg = `Olá! Gostaria de comprar diretamente esta peça no *${storeName}*:\n\n`;
      msg += `🛍️ *${prod.nome}*\n`;
      msg += `📏 *Tamanho Escolhido:* ${size}\n`;
      msg += `💵 *Valor:* ${formatCurrency(prod.preco)}\n`;
      msg += `📦 *Quantidade:* ${state.currentModalQuantity} unidade(s)\n\n`;
      msg += `Poderia me informar as opções de frete e chave PIX para finalizarmos? Obrigado! ✨`;

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }
}

function openProductDetailsModal(produto) {
  state.currentModalProduct = produto;
  state.currentModalQuantity = 1;
  state.selectedSize = 'M'; // Tamanho padrão

  const modal = document.getElementById('productModal');
  const imgEl = document.getElementById('modalProductImage');
  const tagEl = document.getElementById('modalCategoryTag');
  const titleEl = document.getElementById('modalProductTitle');
  const priceEl = document.getElementById('modalProductPrice');
  const installmentEl = document.getElementById('modalPriceInstallment');
  const descEl = document.getElementById('modalProductDesc');
  const badgeEl = document.getElementById('modalStockBadge');
  const stockMaxEl = document.getElementById('modalStockMaxText');
  const addCartBtn = document.getElementById('modalAddToCartBtn');
  const modalFavBtn = document.getElementById('modalFavToggleBtn');
  const sizeChips = document.getElementById('modalSizeChips');

  if (imgEl) imgEl.src = getProductImageUrl(produto);
  if (tagEl) tagEl.textContent = produto.nome_categoria || 'Moda';
  if (titleEl) titleEl.textContent = produto.nome;
  if (priceEl) priceEl.textContent = formatCurrency(produto.preco);
  if (installmentEl) installmentEl.textContent = `ou 6x de ${formatCurrency(produto.preco / 6)} sem juros`;
  if (descEl) descEl.textContent = produto.descricao || 'Peça em tecido nobre, modelagem com caimento impecável e acabamento de alta costura.';

  // Reseta seleção de tamanho para "M"
  if (sizeChips) {
    sizeChips.querySelectorAll('.size-chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-size') === 'M');
    });
  }

  // Atualiza botão de favorito no modal
  if (modalFavBtn) {
    const isFav = isFavorite(produto.id);
    modalFavBtn.classList.toggle('active', isFav);
    const icon = modalFavBtn.querySelector('i');
    if (icon) icon.className = isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  }

  const isAvailable = produto.quantidade > 0;
  if (badgeEl) {
    badgeEl.textContent = isAvailable ? `${produto.quantidade} unidades disponíveis` : 'Produto Esgotado';
    badgeEl.className = isAvailable ? 'modal-stock-badge stock-in' : 'modal-stock-badge stock-out';
  }

  if (stockMaxEl) {
    stockMaxEl.textContent = isAvailable ? `(Máx: ${produto.quantidade})` : '';
  }

  if (addCartBtn) {
    addCartBtn.disabled = !isAvailable;
    addCartBtn.innerHTML = isAvailable ? '<i class="fa-solid fa-bag-shopping"></i> Adicionar à Sacola' : 'Item Esgotado';
  }

  updateModalQuantityInput();

  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }
}

function updateModalQuantityInput() {
  const input = document.getElementById('modalQuantityInput');
  if (input) input.value = state.currentModalQuantity;
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    const cartOverlay = document.getElementById('cartDrawerOverlay');
    if (!cartOverlay || !cartOverlay.classList.contains('active')) {
      document.body.classList.remove('no-scroll');
    }
  }
  state.currentModalProduct = null;
}

// =============================================================================
// MODAL GUIA DE MEDIDAS
// =============================================================================
function setupSizeGuideModalEvents() {
  const btnOpen = document.getElementById('btnOpenSizeGuide');
  const btnClose = document.getElementById('closeSizeGuideBtn');
  const btnConfirm = document.getElementById('closeSizeGuideConfirmBtn');
  const modal = document.getElementById('sizeGuideModal');

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      if (modal) modal.classList.add('active');
    });
  }

  if (btnClose) btnClose.addEventListener('click', closeSizeGuideModal);
  if (btnConfirm) btnConfirm.addEventListener('click', closeSizeGuideModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSizeGuideModal();
    });
  }
}

function closeSizeGuideModal() {
  const modal = document.getElementById('sizeGuideModal');
  if (modal) modal.classList.remove('active');
}

// =============================================================================
// SACOLA DE COMPRAS & CHECKOUT WHATSAPP (ESTILO ZARA / NIKE)
// =============================================================================
function initCart() {
  try {
    const saved = localStorage.getItem('mostruario_carrinho');
    state.cart = saved ? JSON.parse(saved) : [];
  } catch (e) {
    state.cart = [];
  }
  updateCartBadge();
  renderCartItems();
}

function saveCart() {
  localStorage.setItem('mostruario_carrinho', JSON.stringify(state.cart));
  updateCartBadge();
  renderCartItems();
}

function addToCart(produto, quantity = 1, size = 'M') {
  // Identifica por id + tamanho para poder ter o mesmo produto em tamanhos diferentes
  const cartKey = `${produto.id}_${size}`;
  const existing = state.cart.find(item => item.cartKey === cartKey);
  const maxStock = produto.quantidade || 999;

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > maxStock) {
      existing.quantity = maxStock;
      showToast(`Ajustado para o estoque máximo de ${maxStock} unidades.`, 'warning');
    } else {
      existing.quantity = newQty;
      showToast(`+${quantity}x "${produto.nome} (${size})" na sacola!`, 'success');
    }
  } else {
    state.cart.push({
      cartKey: cartKey,
      id: produto.id,
      nome: produto.nome,
      preco: Number(produto.preco),
      quantity: Math.min(quantity, maxStock),
      maxStock: maxStock,
      categoria: produto.nome_categoria || '',
      imagem: getProductImageUrl(produto),
      size: size
    });
    showToast(`"${produto.nome}" (Tam: ${size}) adicionado à sacola!`, 'success');
  }

  saveCart();
}

function updateCartItemQtyByKey(cartKey, delta) {
  const item = state.cart.find(it => it.cartKey === cartKey);
  if (!item) return;

  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    removeFromCartByKey(cartKey);
  } else if (newQty > item.maxStock) {
    showToast(`Estoque máximo atingido (${item.maxStock})`, 'warning');
  } else {
    item.quantity = newQty;
    saveCart();
  }
}

function removeFromCartByKey(cartKey) {
  state.cart = state.cart.filter(item => item.cartKey !== cartKey);
  saveCart();
  showToast('Item removido da sacola.', 'info');
}

function clearCart() {
  if (state.cart.length === 0) return;
  state.cart = [];
  state.activeCoupon = null;
  saveCart();
  showToast('Sacola esvaziada.', 'info');
}

function updateCartBadge() {
  const badge = document.getElementById('cartCountBadge');
  const totalCount = state.cart.reduce((acc, it) => acc + it.quantity, 0);
  if (badge) {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  }
}

function renderCartItems() {
  const listEl = document.getElementById('cartItemsList');
  const totalQtyEl = document.getElementById('cartSummaryTotalQty');
  const totalValEl = document.getElementById('cartSummaryTotalValue');
  const discountRow = document.getElementById('cartDiscountRow');
  const discountValEl = document.getElementById('cartDiscountValue');
  const discountPctEl = document.getElementById('couponDiscountPct');
  const checkoutBtn = document.getElementById('whatsappCheckoutBtn');
  const shippingText = document.getElementById('freeShippingText');
  const shippingBar = document.getElementById('freeShippingProgressBar');

  if (!listEl) return;

  if (state.cart.length === 0) {
    listEl.innerHTML = `
      <div class="cart-empty-message">
        <div class="cart-empty-icon"><i class="fa-solid fa-bag-shopping"></i></div>
        <h4>Sua sacola está vazia</h4>
        <p style="font-size: 0.85rem; margin-top: 6px; color: var(--text-muted);">Explore as novidades do mostruário e escolha suas peças favoritas!</p>
      </div>
    `;
    if (totalQtyEl) totalQtyEl.textContent = '0';
    if (totalValEl) totalValEl.textContent = 'R$ 0,00';
    if (discountRow) discountRow.style.display = 'none';
    if (checkoutBtn) checkoutBtn.disabled = true;

    if (shippingBar) shippingBar.style.width = '0%';
    if (shippingText) {
      shippingText.innerHTML = `<i class="fa-solid fa-truck-fast"></i> Adicione R$ 199,00 para ganhar <strong>Frete Grátis</strong>`;
    }
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  let totalQty = 0;
  let subtotal = 0;

  listEl.innerHTML = '';
  state.cart.forEach(item => {
    const itemTotal = item.preco * item.quantity;
    totalQty += item.quantity;
    subtotal += itemTotal;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${item.imagem}" alt="${escapeHtml(item.nome)}" class="cart-item-img">
      <div class="cart-item-details">
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h4 class="cart-item-title">${escapeHtml(item.nome)}</h4>
            <span class="cart-item-size-badge">Tam: ${escapeHtml(item.size || 'M')}</span>
          </div>
          <span style="font-size: 0.725rem; color: var(--text-muted);">${escapeHtml(item.categoria)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
          <div class="cart-item-qty-controls">
            <button type="button" class="cart-qty-btn" onclick="updateCartItemQtyByKey('${item.cartKey}', -1)">-</button>
            <span class="cart-qty-value">${item.quantity}</span>
            <button type="button" class="cart-qty-btn" onclick="updateCartItemQtyByKey('${item.cartKey}', 1)">+</button>
          </div>
          <span class="cart-item-price">${formatCurrency(itemTotal)}</span>
        </div>
      </div>
      <button type="button" class="btn-remove-item" title="Remover item" onclick="removeFromCartByKey('${item.cartKey}')">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    listEl.appendChild(row);
  });

  // Cálculo da Barra de Frete Grátis
  if (shippingBar && shippingText) {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      shippingBar.style.width = '100%';
      shippingText.innerHTML = `🎉 Parabéns! Você ganhou <strong>Frete Grátis</strong>!`;
    } else {
      const diff = FREE_SHIPPING_THRESHOLD - subtotal;
      const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      shippingBar.style.width = `${pct}%`;
      shippingText.innerHTML = `<i class="fa-solid fa-truck-fast"></i> Faltam apenas <strong>${formatCurrency(diff)}</strong> para <strong>Frete Grátis</strong>!`;
    }
  }

  // Aplicação do Cupom de Desconto
  let discountAmount = 0;
  if (state.activeCoupon && state.activeCoupon.discountPct > 0) {
    discountAmount = subtotal * (state.activeCoupon.discountPct / 100);
    if (discountRow) {
      discountRow.style.display = 'flex';
      if (discountPctEl) discountPctEl.textContent = `${state.activeCoupon.discountPct}%`;
      if (discountValEl) discountValEl.textContent = `-${formatCurrency(discountAmount)}`;
    }
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  if (totalQtyEl) totalQtyEl.textContent = totalQty;
  if (totalValEl) totalValEl.textContent = formatCurrency(finalTotal);
}

window.updateCartItemQtyByKey = updateCartItemQtyByKey;
window.removeFromCartByKey = removeFromCartByKey;

function setupCartEvents() {
  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const overlay = document.getElementById('cartDrawerOverlay');
  const checkoutBtn = document.getElementById('whatsappCheckoutBtn');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const btnApplyCoupon = document.getElementById('btnApplyCoupon');
  const couponInput = document.getElementById('cartCouponInput');

  if (openCartBtn) openCartBtn.addEventListener('click', openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeCartDrawer();
    });
  }

  if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);

  if (btnApplyCoupon && couponInput) {
    btnApplyCoupon.addEventListener('click', () => {
      applyCoupon(couponInput.value.trim().toUpperCase());
    });
    couponInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyCoupon(couponInput.value.trim().toUpperCase());
      }
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleWhatsAppCheckout);
  }
}

function applyCoupon(code) {
  const msgEl = document.getElementById('couponMessage');
  if (!code) {
    if (msgEl) {
      msgEl.textContent = 'Informe o código do cupom.';
      msgEl.style.color = '#ef4444';
    }
    return;
  }

  if (PROMO_COUPONS[code]) {
    const pct = PROMO_COUPONS[code];
    state.activeCoupon = { code: code, discountPct: pct };
    if (msgEl) {
      msgEl.textContent = `Cupom ${code} aplicado: ${pct}% OFF! 🎉`;
      msgEl.style.color = '#16a34a';
    }
    showToast(`Cupom ativado com ${pct}% de desconto!`, 'success');
    renderCartItems();
  } else {
    state.activeCoupon = null;
    if (msgEl) {
      msgEl.textContent = 'Cupom inválido ou expirado.';
      msgEl.style.color = '#ef4444';
    }
    showToast('Cupom inválido. Tente PRIMEIRACOMPRA ou FASHION15.', 'warning');
    renderCartItems();
  }
}

function openCartDrawer() {
  const overlay = document.getElementById('cartDrawerOverlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.classList.add('no-scroll');
  }
}

function closeCartDrawer() {
  const overlay = document.getElementById('cartDrawerOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }
}

function handleWhatsAppCheckout() {
  if (state.cart.length === 0) {
    showToast('Adicione pelo menos uma peça à sua sacola.', 'warning');
    return;
  }

  const customerNameInput = document.getElementById('cartCustomerName');
  const deliveryCityInput = document.getElementById('cartDeliveryCity');
  const customerName = customerNameInput?.value.trim() || 'Cliente';
  const deliveryCity = deliveryCityInput?.value.trim() || '';
  const storeName = state.currentStore ? state.currentStore.nome : 'Mostruário';

  const totalQty = state.cart.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = state.cart.reduce((acc, it) => acc + (it.preco * it.quantity), 0);
  let discountAmount = 0;
  if (state.activeCoupon) {
    discountAmount = subtotal * (state.activeCoupon.discountPct / 100);
  }
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  let text = `🛍️ *NOVO PEDIDO - ${storeName.toUpperCase()}*\n`;
  text += `👤 *Cliente:* ${customerName}\n`;
  if (deliveryCity) {
    text += `📍 *Destino / CEP:* ${deliveryCity}\n`;
  }
  text += `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
  text += `-------------------------------------------\n`;
  text += `📦 *PEÇAS SELECIONADAS:*\n\n`;

  state.cart.forEach((item, index) => {
    const itemTotal = item.preco * item.quantity;
    text += `${index + 1}. *${item.nome}*\n`;
    text += `   • Categoria: ${item.categoria || 'Geral'}\n`;
    text += `   • Tamanho: *${item.size || 'M'}*\n`;
    text += `   • Quantidade: ${item.quantity}x\n`;
    text += `   • Unitário: ${formatCurrency(item.preco)}\n`;
    text += `   • Subtotal: ${formatCurrency(itemTotal)}\n\n`;
  });

  text += `-------------------------------------------\n`;
  text += `📊 *Quantidade de Peças:* ${totalQty}\n`;
  text += `💵 *Subtotal:* ${formatCurrency(subtotal)}\n`;

  if (state.activeCoupon) {
    text += `🎟️ *Cupom Aplicado:* ${state.activeCoupon.code} (-${state.activeCoupon.discountPct}%): -${formatCurrency(discountAmount)}\n`;
  }

  text += `🚚 *Frete:* ${hasFreeShipping ? 'GRÁTIS (Pedido acima de R$ 199) 🎉' : 'A calcular'}\n`;
  text += `💰 *VALOR TOTAL: ${formatCurrency(finalTotal)}*\n`;
  text += `-------------------------------------------\n`;
  text += `Olá! Gostaria de confirmar a disponibilidade destas peças nos tamanhos selecionados e prosseguir com o pagamento. Aguardo orientações! ✨`;

  const wppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(wppUrl, '_blank');
}

// =============================================================================
// UTILITÁRIOS & TOASTS
// =============================================================================
function formatCurrency(val) {
  const num = Number(val) || 0;
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  else if (type === 'error') icon = 'fa-triangle-exclamation';
  else if (type === 'warning') icon = 'fa-circle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => toast.classList.add('active'), 10);

  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}
