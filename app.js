// ── YieldScan v3 — Multi-language DeFi Stablecoin Yield Aggregator ──
// Data source: DefiLlama Yields API (public, no key required)

const LLAMA_API = 'https://yields.llama.fi';
const POLL_INTERVAL = 5 * 60 * 1000;
const CACHE_KEY = 'yieldscan_cache';
const CACHE_TTL = 4 * 60 * 1000;

// ── i18n / Internationalisation ──
const LANGUAGES = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  pt: 'Português',
};

const I18N = {
  title: { en: 'YieldScan — DeFi Stablecoin Yield Aggregator', zh: 'YieldScan — DeFi 稳定币收益率聚合器', ja: 'YieldScan — DeFi ステーブルコイン利回りアグリゲーター', ko: 'YieldScan — DeFi 스테이블코인 수익률 집계기', es: 'YieldScan — Agregador de Rendimientos DeFi Stablecoin', pt: 'YieldScan — Agregador de Rendimentos DeFi Stablecoin' },
  heroTitle: { en: 'Stablecoin Yield <span class="gradient-text">Aggregator</span>', zh: '稳定币收益率<span class="gradient-text">聚合器</span>', ja: 'ステーブルコイン利回り<span class="gradient-text">アグリゲーター</span>', ko: '스테이블코인 수익률<span class="gradient-text">집계기</span>', es: '<span class="gradient-text">Agregador</span> de Rendimientos Stablecoin', pt: '<span class="gradient-text">Agregador</span> de Rendimentos Stablecoin' },
  heroSub: { en: 'Real-time USDT, USDC & stablecoin yields across 30+ DeFi protocols. Powered by DefiLlama.', zh: '实时追踪 30+ DeFi 协议的 USDT/USDC 及稳定币收益率。数据来自 DefiLlama。', ja: '30以上のDeFiプロトコルのUSDT/USDCおよびステーブルコインの利回りをリアルタイムで追跡。DefiLlama提供。', ko: '30개 이상의 DeFi 프로토콜에서 USDT/USDC 및 스테이블코인 수익률을 실시간 추적. DefiLlama 제공.', es: 'Rendimientos en tiempo real de USDT, USDC y stablecoins en más de 30 protocolos DeFi. Datos de DefiLlama.', pt: 'Rendimentos em tempo real de USDT, USDC e stablecoins em mais de 30 protocolos DeFi. Dados do DefiLlama.' },
  bestUsdt: { en: 'Best USDT APY', zh: 'USDT 最佳年化', ja: 'USDT 最高利回り', ko: 'USDT 최고 APY', es: 'Mejor APY USDT', pt: 'Melhor APY USDT' },
  bestUsdc: { en: 'Best USDC APY', zh: 'USDC 最佳年化', ja: 'USDC 最高利回り', ko: 'USDC 최고 APY', es: 'Mejor APY USDC', pt: 'Melhor APY USDC' },
  protoCount: { en: 'Protocols Tracked', zh: '追踪协议数', ja: '追跡プロトコル数', ko: '추적 프로토콜', es: 'Protocolos Rastreados', pt: 'Protocolos Rastreados' },
  avgApy: { en: 'Avg. Stable APY', zh: '稳定币均年化', ja: '平均利回り', ko: '평균 APY', es: 'APY Promedio', pt: 'APY Médio' },
  connectWallet: { en: 'Connect Wallet', zh: '连接钱包', ja: 'ウォレット接続', ko: '지갑 연결', es: 'Conectar Wallet', pt: 'Conectar Carteira' },
  assetLabel: { en: 'Asset', zh: '资产', ja: '資産', ko: '자산', es: 'Activo', pt: 'Ativo' },
  riskLabel: { en: 'Risk Level', zh: '风险等级', ja: 'リスクレベル', ko: '위험 등급', es: 'Nivel de Riesgo', pt: 'Nível de Risco' },
  chainLabel: { en: 'Chain', zh: '链', ja: 'チェーン', ko: '체인', es: 'Red', pt: 'Rede' },
  typeLabel: { en: 'Type', zh: '类型', ja: 'タイプ', ko: '유형', es: 'Tipo', pt: 'Tipo' },
  filterAll: { en: 'All', zh: '全部', ja: 'すべて', ko: '전체', es: 'Todos', pt: 'Todos' },
  riskLow: { en: '🟢 Low', zh: '🟢 低', ja: '🟢 低', ko: '🟢 낮음', es: '🟢 Bajo', pt: '🟢 Baixo' },
  riskMed: { en: '🟡 Medium', zh: '🟡 中', ja: '🟡 中', ko: '🟡 중간', es: '🟡 Medio', pt: '🟡 Médio' },
  riskHigh: { en: '🔴 High', zh: '🔴 高', ja: '🔴 高', ko: '🔴 높음', es: '🔴 Alto', pt: '🔴 Alto' },
  typeLending: { en: 'Lending', zh: '借贷', ja: 'レンディング', ko: '대출', es: 'Préstamo', pt: 'Empréstimo' },
  typeDexLp: { en: 'DEX LP', zh: 'DEX LP', ja: 'DEX LP', ko: 'DEX LP', es: 'DEX LP', pt: 'DEX LP' },
  typeYield: { en: 'Yield', zh: '收益', ja: 'イールド', ko: '수익', es: 'Rendimiento', pt: 'Rendimento' },
  typeLsd: { en: 'Liquid Staking', zh: '流动质押', ja: 'リキッドステーキング', ko: '리퀴드 스테이킹', es: 'Staking Líquido', pt: 'Staking Líquido' },
  typeOther: { en: 'Other', zh: '其他', ja: 'その他', ko: '기타', es: 'Otros', pt: 'Outros' },
  thProtocol: { en: 'Protocol', zh: '协议', ja: 'プロトコル', ko: '프로토콜', es: 'Protocolo', pt: 'Protocolo' },
  thAsset: { en: 'Asset', zh: '资产', ja: '資産', ko: '자산', es: 'Activo', pt: 'Ativo' },
  thChain: { en: 'Chain', zh: '链', ja: 'チェーン', ko: '체인', es: 'Red', pt: 'Rede' },
  thType: { en: 'Type', zh: '类型', ja: 'タイプ', ko: '유형', es: 'Tipo', pt: 'Tipo' },
  thApy: { en: 'APY', zh: '年化', ja: '利回り', ko: 'APY', es: 'APY', pt: 'APY' },
  thTvl: { en: 'TVL', zh: '锁仓量', ja: 'TVL', ko: 'TVL', es: 'TVL', pt: 'TVL' },
  thRisk: { en: 'Risk', zh: '风险', ja: 'リスク', ko: '위험', es: 'Riesgo', pt: 'Risco' },
  loadingText: { en: 'Fetching live yields from DefiLlama...', zh: '正在从 DefiLlama 获取实时数据...', ja: 'DefiLlamaからリアルタイムデータを取得中...', ko: 'DefiLlama에서 실시간 데이터 가져오는 중...', es: 'Obteniendo datos en vivo de DefiLlama...', pt: 'Buscando dados ao vivo do DefiLlama...' },
  fetchError: { en: 'Failed to fetch data', zh: '数据获取失败', ja: 'データ取得に失敗', ko: '데이터 가져오기 실패', es: 'Error al obtener datos', pt: 'Falha ao buscar dados' },
  retryBtn: { en: '🔄 Retry', zh: '🔄 重试', ja: '🔄 再試行', ko: '🔄 재시도', es: '🔄 Reintentar', pt: '🔄 Tentar Novamente' },
  noResults: { en: 'No results matching your filters', zh: '没有符合筛选条件的结果', ja: '条件に一致する結果がありません', ko: '필터와 일치하는 결과가 없습니다', es: 'Sin resultados para estos filtros', pt: 'Sem resultados para estes filtros' },
  viewDefiLlama: { en: 'View on DefiLlama', zh: '在 DefiLlama 查看', ja: 'DefiLlamaで見る', ko: 'DefiLlama에서 보기', es: 'Ver en DefiLlama', pt: 'Ver no DefiLlama' },
  riskLowLabel: { en: 'Low', zh: '低', ja: '低', ko: '낮음', es: 'Bajo', pt: 'Baixo' },
  riskMedLabel: { en: 'Medium', zh: '中', ja: '中', ko: '중간', es: 'Medio', pt: 'Médio' },
  riskHighLabel: { en: 'High', zh: '高', ja: '高', ko: '높음', es: 'Alto', pt: 'Alto' },
  rewardsLabel: { en: 'rewards', zh: '激励', ja: '報酬', ko: '보상', es: 'recompensas', pt: 'recompensas' },
  footerData: { en: '📊 Data: DefiLlama • Auto-refreshes every 5 min', zh: '📊 数据来源：DefiLlama • 每 5 分钟自动刷新', ja: '📊 データ：DefiLlama • 5分ごとに自動更新', ko: '📊 데이터: DefiLlama • 5분마다 자동 갱신', es: '📊 Datos: DefiLlama • Actualización cada 5 min', pt: '📊 Dados: DefiLlama • Atualização a cada 5 min' },
  footerDisclaimer: { en: '⚠️ Not financial advice. DYOR. APY subject to change.', zh: '⚠️ 不构成投资建议。请自行研究。APY 随时变化。', ja: '⚠️ 投資助言ではありません。ご自身で調査ください。APYは変動します。', ko: '⚠️ 투자 조언이 아닙니다. 스스로 조사하세요. APY는 변동될 수 있습니다.', es: '⚠️ No es asesoría financiera. DYOR. APY sujeto a cambios.', pt: '⚠️ Não é aconselhamento financeiro. DYOR. APY sujeito a alterações.' },
  noWallet: { en: 'Please install a Web3 wallet (MetaMask, Rabby, etc.) to connect.', zh: '请安装 Web3 钱包（MetaMask、Rabby 等）后连接。', ja: '接続するにはWeb3ウォレット（MetaMask、Rabbyなど）をインストールしてください。', ko: '연결하려면 Web3 지갑(MetaMask, Rabby 등)을 설치하세요.', es: 'Instala una wallet Web3 (MetaMask, Rabby, etc.) para conectar.', pt: 'Instale uma carteira Web3 (MetaMask, Rabby, etc.) para conectar.' },
  walletRejected: { en: 'Connection rejected. Click "Connect Wallet" to try again.', zh: '连接被拒绝。请点击「连接钱包」重试。', ja: '接続が拒否されました。「ウォレット接続」をクリックして再試行してください。', ko: '연결이 거부되었습니다. "지갑 연결"을 클릭하여 다시 시도하세요.', es: 'Conexión rechazada. Haz clic en "Conectar Wallet" para reintentar.', pt: 'Conexão rejeitada. Clique em "Conectar Carteira" para tentar novamente.' },
  walletFailed: { en: 'Failed to connect', zh: '连接失败', ja: '接続に失敗しました', ko: '연결 실패', es: 'Error al conectar', pt: 'Falha ao conectar' },
  refreshTitle: { en: 'Refresh data', zh: '刷新数据', ja: 'データを更新', ko: '데이터 새로고침', es: 'Actualizar datos', pt: 'Atualizar dados' },
};

let currentLang = 'en';

function t(key) {
  const entry = I18N[key];
  if (!entry) return key;
  return entry[currentLang] || entry['en'] || key;
}

function setLang(lang) {
  if (!LANGUAGES[lang]) return;
  currentLang = lang;
  localStorage.setItem('yieldscan_lang', lang);

  // Update all [data-i18n] elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const entry = I18N[key];
    if (!entry) return;
    const text = entry[currentLang] || entry['en'];
    if (!text) return;

    // Handle <span> inside (for gradient text in heroTitle)
    if (text.includes('<span')) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
  });

  // Update table headers (they use data-i18n-th)
  document.querySelectorAll('[data-i18n-th]').forEach(el => {
    const key = el.dataset.i18nTh;
    const text = I18N[key]?.[currentLang] || I18N[key]?.['en'] || key;
    // Keep sort icon
    const icon = el.querySelector('.sort-icon');
    el.childNodes[0] && el.childNodes[0].nodeType === 3 && (el.childNodes[0].textContent = text + ' ');
  });

  // Update filter chips (data-i18n-chip)
  document.querySelectorAll('[data-i18n-chip]').forEach(el => {
    const key = el.dataset.i18nChip;
    const text = I18N[key]?.[currentLang] || I18N[key]?.['en'] || key;
    el.textContent = text;
  });

  // Update footer
  const footerData = document.getElementById('footerData');
  const footerDisclaimer = document.getElementById('footerDisclaimer');
  if (footerData) footerData.textContent = t('footerData');
  if (footerDisclaimer) footerDisclaimer.textContent = t('footerDisclaimer');

  // Update wallet button if not connected
  const walletBtn = document.getElementById('walletBtn');
  if (walletBtn && !walletAddress) {
    walletBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="15" r="1"/></svg> ${t('connectWallet')}`;
  }

  // Update language selector active state
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });

  // Update document title
  document.title = I18N['title']?.[lang] || I18N['title']?.['en'] || 'YieldScan';

  // Re-render table (for loading state and risk labels etc.)
  renderAll();
}

function detectLang() {
  // Priority: 1. saved pref, 2. browser lang, 3. en fallback
  const saved = localStorage.getItem('yieldscan_lang');
  if (saved && LANGUAGES[saved]) return saved;

  const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('ko')) return 'ko';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('pt')) return 'pt';
  return 'en';
}

// ── Protocol data ──
const STABLECOIN_SYMBOLS = ['USDC', 'USDT', 'DAI', 'USDe', 'FRAX', 'sUSDe'];
const TARGET_CHAINS = ['Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Solana', 'Polygon', 'Avalanche', 'BNB Chain'];
const RISK_MAP = {
  'Aave V3': 'Low', 'Aave V2': 'Low',
  'Compound V3': 'Low', 'Compound V2': 'Low',
  'Spark': 'Low', 'Maker': 'Low',
  'Morpho Blue': 'Medium', 'Fluid': 'Medium',
  'Curve': 'Low', 'Curve Finance': 'Low',
  'Uniswap V3': 'Medium', 'Aerodrome': 'Medium',
  'Pendle': 'High', 'Ethena': 'High',
  'Venus': 'Medium', 'Kamino': 'Low', 'Drift': 'Medium',
  'Euler': 'Medium', 'Silo': 'Medium',
  'Yearn Finance': 'Low', 'Beefy': 'Medium',
  'Convex Finance': 'Medium', 'Stargate': 'Medium',
  'SushiSwap': 'Medium', 'Balancer': 'Low',
  'Maverick': 'Medium', 'Trader Joe': 'Medium',
  'Quickswap': 'Medium', 'Benqi': 'Medium',
  'Radiant': 'Medium', 'Extra Finance': 'Medium',
  'Moonwell': 'Medium', 'Aura': 'Medium',
  'Sommelier': 'Medium', 'Sturdy': 'High',
};

// ── State ──
let yieldData = [];
let filtered = [];
let sortKey = 'apy';
let sortDir = 'desc';
let activeFilters = { risk: 'all', chain: 'all', type: 'all', asset: 'all' };
let isLoading = true;
let lastFetchTime = null;
let fetchError = null;

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  currentLang = detectLang();
  setLang(currentLang); // apply text now
  renderAll();
  bindFilters();
  bindSort();
  bindRefresh();
  bindLangToggle();
  await loadData();
});

// ── Language toggle ──
function bindLangToggle() {
  const trigger = document.getElementById('langTrigger');
  const dropdown = document.getElementById('langDropdown');
  if (!trigger || !dropdown) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  dropdown.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const lang = opt.dataset.lang;
      setLang(lang);
      dropdown.classList.remove('open');
    });
  });
}

// ── Data loading ──
async function loadData(forceRefresh = false) {
  isLoading = true;
  fetchError = null;
  updateLoadingState();

  if (!forceRefresh) {
    const cached = getCache();
    if (cached) {
      yieldData = cached.data;
      lastFetchTime = cached.timestamp;
      isLoading = false;
      renderAll();
      return;
    }
  }

  try {
    const res = await fetch(`${LLAMA_API}/pools`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const allPools = await res.json();
    const pools = allPools.data || allPools;

    yieldData = pools
      .filter(p =>
        STABLECOIN_SYMBOLS.includes(p.symbol) &&
        TARGET_CHAINS.includes(p.chain) &&
        p.apy !== null &&
        p.apy > 0 &&
        p.tvlUsd > 100000 &&
        !isExtremeOutlier(p)
      )
      .map(p => ({
        protocol: p.project,
        pool: p.pool,
        poolMeta: p.poolMeta || '',
        asset: p.symbol,
        chain: p.chain,
        type: mapType(p.exposure, p.category),
        apy: p.apy,
        apyBase: p.apyBase || p.apy,
        apyReward: p.apyReward || 0,
        tvl: formatTVL(p.tvlUsd),
        tvlRaw: p.tvlUsd,
        risk: classifyRisk(p.project, p),
        ilRisk: p.ilRisk || 'no',
        stablecoin: p.stablecoin || true,
        audit: p.audit || false,
        url: generateProtocolUrl(p.project, p.chain),
        icon: generateIcon(p.project),
      }))
      .reduce((acc, row) => {
        const key = `${row.protocol}|${row.asset}|${row.chain}`;
        const existing = acc.get(key);
        if (!existing || row.apy > existing.apy) acc.set(key, row);
        return acc;
      }, new Map());

    yieldData = [...yieldData.values()].sort((a, b) => b.apy - a.apy);

    lastFetchTime = Date.now();
    saveCache({ data: yieldData, timestamp: lastFetchTime });
    fetchError = null;
  } catch (err) {
    console.error('YieldScan: fetch failed', err);
    fetchError = err.message;
    const cached = getCache(true);
    if (cached) {
      yieldData = cached.data;
      lastFetchTime = cached.timestamp;
    }
  } finally {
    isLoading = false;
    renderAll();
  }
}

function mapType(exposure, category) {
  if (exposure === 'single' && category === 'Lending') return 'Lending';
  if (category === 'Yield' || category === 'Yield Aggregator') return 'Yield';
  if (category === 'Liquid Staking') return 'Liquid Staking';
  if (exposure === 'multi') return 'DEX LP';
  return 'Other';
}

function classifyRisk(project, p) {
  for (const [key, risk] of Object.entries(RISK_MAP)) {
    if (project.toLowerCase().includes(key.toLowerCase())) return risk;
  }
  return 'Medium';
}

function generateIcon(project) {
  const colors = [
    '#B6509E', '#00D395', '#2463EB', '#F5A623', '#EF4444',
    '#FF007A', '#8B5CF6', '#6366F1', '#3B82F6', '#10B981',
    '#06B6D4', '#22C55E', '#F97316', '#EC4899', '#14B8A6',
  ];
  const idx = project.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
}

function isExtremeOutlier(p) {
  if (!p.apy || !p.tvlUsd) return false;
  if (p.apyBase > 100 && p.tvlUsd < 1_000_000) return true;
  return false;
}

function generateProtocolUrl(project, chain) {
  return `https://defillama.com/protocol/${project.toLowerCase().replace(/\s+/g, '-')}`;
}

// ── Cache ──
function getCache(ignoreTTL = false) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    if (!ignoreTTL && Date.now() - cache.timestamp > CACHE_TTL) return null;
    if (!Array.isArray(cache.data)) return null;
    return cache;
  } catch { return null; }
}

function saveCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {}
}

// ── Render ──
function renderAll() {
  applyFilters();
  applySort();
  updateStats();
  updateChainFilter();
  updateAssetFilter();
  renderTable();
  updateTimestamp();
}

function applyFilters() {
  filtered = yieldData.filter(row => {
    if (activeFilters.risk !== 'all' && row.risk !== activeFilters.risk) return false;
    if (activeFilters.chain !== 'all' && row.chain !== activeFilters.chain) return false;
    if (activeFilters.type !== 'all' && row.type !== activeFilters.type) return false;
    if (activeFilters.asset !== 'all' && row.asset !== activeFilters.asset) return false;
    return true;
  });
}

function applySort() {
  filtered.sort((a, b) => {
    let va = a[sortKey], vb = b[sortKey];
    if (typeof va === 'string') va = va.toLowerCase(), vb = vb.toLowerCase();
    if (typeof va === 'string' && va.startsWith('$')) {
      va = parseFloat(va.replace(/[$BMK]/g, ''));
      vb = parseFloat(vb.replace(/[$BMK]/g, ''));
    }
    if (sortDir === 'asc') return va > vb ? 1 : -1;
    return va < vb ? 1 : -1;
  });
}

function updateStats() {
  const best = [...yieldData].sort((a, b) => b.apy - a.apy);
  document.getElementById('bestUsdt').textContent =
    best.filter(r => r.asset === 'USDT')[0]?.apy.toFixed(2) + '%' || '—';
  document.getElementById('bestUsdc').textContent =
    best.filter(r => r.asset === 'USDC')[0]?.apy.toFixed(2) + '%' || '—';
  document.getElementById('protoCount').textContent =
    [...new Set(yieldData.map(r => r.protocol))].length || '—';
  document.getElementById('avgApy').textContent =
    yieldData.length ? (yieldData.reduce((s, r) => s + r.apy, 0) / yieldData.length).toFixed(2) + '%' : '—';
}

function translatedRisk(risk) {
  return I18N['risk' + risk + 'Label']?.[currentLang] || risk;
}

function translatedType(type) {
  const map = { 'Lending': 'typeLending', 'DEX LP': 'typeDexLp', 'Yield': 'typeYield', 'Liquid Staking': 'typeLsd', 'Other': 'typeOther' };
  const key = map[type] || type;
  return I18N[key]?.[currentLang] || type;
}

function updateChainFilter() {
  const chains = [...new Set(yieldData.map(r => r.chain))].sort();
  const container = document.getElementById('chainFilter');
  const active = container.querySelector('.chip.active');
  const activeVal = active ? active.dataset.value : 'all';
  container.querySelectorAll('.chip:not(:first-child)').forEach(c => c.remove());
  chains.forEach(chain => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    if (chain === activeVal) btn.classList.add('active');
    btn.dataset.value = chain;
    btn.textContent = chain;
    btn.addEventListener('click', () => toggleFilter('chain', btn, container));
    container.appendChild(btn);
  });
}

function updateAssetFilter() {
  const assets = [...new Set(yieldData.map(r => r.asset))].sort();
  const container = document.getElementById('assetFilter');
  const active = container.querySelector('.chip.active');
  const activeVal = active ? active.dataset.value : 'all';
  container.querySelectorAll('.chip:not(:first-child)').forEach(c => c.remove());
  assets.forEach(asset => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    if (asset === activeVal) btn.classList.add('active');
    btn.dataset.value = asset;
    btn.textContent = asset;
    btn.addEventListener('click', () => toggleFilter('asset', btn, container));
    container.appendChild(btn);
  });
}

function renderTable() {
  const tbody = document.getElementById('tableBody');

  if (isLoading && yieldData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="loading-state">
      <div class="spinner"></div>
      <p>${t('loadingText')}</p>
    </td></tr>`;
    return;
  }

  if (fetchError && yieldData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
      <p style="color:var(--accent-red)">${t('fetchError')}: ${escapeHtml(fetchError)}</p>
      <button class="retry-btn" onclick="loadData(true)">${t('retryBtn')}</button>
    </td></tr>`;
    return;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>
      </svg>
      <p>${t('noResults')}</p>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(row => {
    const apyClass = row.apy > 10 ? 'apy-high' : row.apy > 5 ? 'apy-mid' : 'apy-positive';
    const ilLabel = row.ilRisk === 'yes' ? ' ⚠️IL' : '';
    const rewardStr = row.apyReward > 0.1
      ? ` <span class="reward-hint">(+${row.apyReward.toFixed(1)}% ${t('rewardsLabel')})</span>` : '';
    const riskLabel = translatedRisk(row.risk);
    const typeLabel = translatedType(row.type);
    const viewTitle = escapeAttr(t('viewDefiLlama'));

    return `<tr style="cursor:pointer" onclick="window.open('${escapeAttr(row.url)}', '_blank')" title="${viewTitle}">
      <td><div class="protocol-cell">
        <div class="protocol-icon" style="background:${row.icon}">${row.protocol[0]?.toUpperCase() || '?'}</div>
        <div>
          <span style="font-weight:600">${escapeHtml(row.protocol)}</span>
          ${row.poolMeta ? `<span style="color:var(--text-muted);font-size:0.75rem;display:block">${escapeHtml(row.poolMeta)}</span>` : ''}
        </div>
      </div></td>
      <td><span style="font-family:'JetBrains Mono',monospace;font-size:0.8rem">${row.asset}</span></td>
      <td><span class="chain-badge">${row.chain}</span></td>
      <td><span style="color:var(--text-secondary)">${typeLabel}${ilLabel}</span></td>
      <td><span class="apy-cell ${apyClass}">${row.apy.toFixed(2)}%${rewardStr}</span></td>
      <td><span class="tvl-cell">${row.tvl}</span></td>
      <td><span class="risk-badge ${row.risk.toLowerCase()}">${riskLabel}</span></td>
      <td><span class="external-link-icon" title="${viewTitle}">↗</span></td>
    </tr>`;
  }).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatTVL(usd) {
  if (usd >= 1e9) return '$' + (usd / 1e9).toFixed(2) + 'B';
  if (usd >= 1e6) return '$' + (usd / 1e6).toFixed(1) + 'M';
  if (usd >= 1e3) return '$' + (usd / 1e3).toFixed(0) + 'K';
  return '$' + usd.toFixed(0);
}

// ── Filters ──
function bindFilters() {
  document.getElementById('riskFilter').addEventListener('click', e => {
    if (e.target.classList.contains('chip')) toggleFilter('risk', e.target, e.currentTarget);
  });
  document.getElementById('chainFilter').addEventListener('click', e => {
    if (e.target.classList.contains('chip')) toggleFilter('chain', e.target, e.currentTarget);
  });
  document.getElementById('typeFilter').addEventListener('click', e => {
    if (e.target.classList.contains('chip')) toggleFilter('type', e.target, e.currentTarget);
  });
  document.getElementById('assetFilter').addEventListener('click', e => {
    if (e.target.classList.contains('chip')) toggleFilter('asset', e.target, e.currentTarget);
  });
}

function toggleFilter(name, btn, container) {
  container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  activeFilters[name] = btn.dataset.value;
  renderAll();
}

// ── Sort ──
function bindSort() {
  document.querySelectorAll('.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (sortKey === key) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey = key;
        sortDir = key === 'apy' ? 'desc' : 'asc';
      }
      document.querySelectorAll('.sortable .sort-icon').forEach(icon => icon.textContent = '');
      const icon = th.querySelector('.sort-icon');
      if (icon) icon.textContent = sortDir === 'asc' ? '↑' : '↓';
      renderAll();
    });
  });
}

function bindRefresh() {
  const btn = document.getElementById('refreshBtn');
  if (btn) btn.addEventListener('click', () => loadData(true));
}

function updateLoadingState() {
  const btn = document.getElementById('refreshBtn');
  if (!btn) return;
  if (isLoading) { btn.classList.add('spinning'); btn.disabled = true; }
  else { btn.classList.remove('spinning'); btn.disabled = false; }
}

function updateTimestamp() {
  const el = document.getElementById('updateTime');
  if (!el) return;

  if (isLoading) {
    el.textContent = '🔄 ...';
    el.className = 'update-badge updating';
    return;
  }

  if (lastFetchTime) {
    const diff = Math.floor((Date.now() - lastFetchTime) / 1000);
    const ago = diff < 60 ? `${diff}s` :
      diff < 3600 ? `${Math.floor(diff / 60)}m` :
      `${Math.floor(diff / 3600)}h`;
    el.textContent = `🟢 Live • ${ago}`;
    el.className = 'update-badge live';
  } else {
    el.textContent = '—';
    el.className = 'update-badge';
  }
}

// ── Auto-refresh ──
setInterval(() => {
  if (document.visibilityState === 'visible') loadData();
}, POLL_INTERVAL);

// ── Wallet ──
let walletAddress = null;
let walletProvider = null;

window.connectWallet = async function() {
  if (walletAddress) {
    walletAddress = null;
    walletProvider = null;
    updateWalletUI();
    return;
  }

  try {
    if (window.ethereum) {
      walletProvider = window.ethereum;
      const accounts = await walletProvider.request({ method: 'eth_requestAccounts' });
      walletAddress = accounts[0];
      walletProvider.on('accountsChanged', (accounts) => {
        walletAddress = accounts.length > 0 ? accounts[0] : null;
        updateWalletUI();
      });
      walletProvider.on('chainChanged', () => window.location.reload());
      updateWalletUI();
    } else {
      alert(t('noWallet'));
    }
  } catch (err) {
    console.error('Wallet connection failed:', err);
    if (err.code === 4001) {
      alert(t('walletRejected'));
    } else {
      alert(t('walletFailed') + ': ' + err.message);
    }
  }
};

function updateWalletUI() {
  const btn = document.getElementById('walletBtn');
  if (!btn) return;
  if (walletAddress) {
    const short = walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
    btn.innerHTML = `<span class="wallet-dot"></span> ${short}`;
    btn.classList.add('connected');
  } else {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="15" r="1"/></svg> ${t('connectWallet')}`;
    btn.classList.remove('connected');
  }
}