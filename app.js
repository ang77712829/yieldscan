// ── YieldScan v2 — Live DeFi Stablecoin Yield Aggregator ──
// Data source: DefiLlama Yields API (public, no key required)

const LLAMA_API = 'https://yields.llama.fi';
const POLL_INTERVAL = 5 * 60 * 1000; // refresh every 5 min
const CACHE_KEY = 'yieldscan_cache';
const CACHE_TTL = 4 * 60 * 1000; // cache valid 4 min

// ── Protocol config: DefiLlama pool IDs for stablecoins we track ──
const TRACKED_POOLS = {
  // pool id -> { protocol, asset, chain, type, risk, displayName }
  // These are deterministic pool UUIDs from DefiLlama yields
};

// Alternative: fetch full stablecoin list from DefiLlama and filter

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

// ── Asset icons as emoji fallback ──
const ASSET_ICONS = {
  USDC: '💲', USDT: '💵', DAI: '🟡', USDe: '🔵', FRAX: '🟢', sUSDe: '🔷',
};
const CHAIN_COLORS = {
  Ethereum: '#627EEA', Arbitrum: '#28A0F0', Optimism: '#FF0420',
  Base: '#0052FF', Solana: '#9945FF', Polygon: '#8247E5',
  'BNB Chain': '#F0B90B', Avalanche: '#E84142', Gnosis: '#04795B',
};

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  renderAll();
  bindFilters();
  bindSort();
  bindRefresh();
  await loadData();
});

// ── Data loading ──
async function loadData(forceRefresh = false) {
  isLoading = true;
  fetchError = null;
  updateLoadingState();

  // Try cache first
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
    // Fetch pools from DefiLlama yields API
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
        p.tvlUsd > 100000 // filter dust
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
      // Deduplicate: keep highest APY per protocol+asset+chain combo
      .reduce((acc, row) => {
        const key = `${row.protocol}|${row.asset}|${row.chain}`;
        const existing = acc.get(key);
        if (!existing || row.apy > existing.apy) {
          acc.set(key, row);
        }
        return acc;
      }, new Map());

    yieldData = [...yieldData.values()].sort((a, b) => b.apy - a.apy);

    lastFetchTime = Date.now();
    saveCache({ data: yieldData, timestamp: lastFetchTime });
    fetchError = null;
  } catch (err) {
    console.error('YieldScan: fetch failed', err);
    fetchError = err.message;
    // Fall back to cache if available, even if expired
    const cached = getCache(true);
    if (cached) {
      yieldData = cached.data;
      lastFetchTime = cached.timestamp;
      console.warn('YieldScan: using stale cache');
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
  return 'Lending';
}

function classifyRisk(project) {
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

function generateProtocolUrl(project, chain) {
  const defiLlamaUrl = `https://defillama.com/protocol/${project.toLowerCase().replace(/\s+/g, '-')}`;
  return defiLlamaUrl;
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
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* quota exceeded, ignore */ }
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
    if (typeof va === 'string' && va.startsWith('$')) va = parseFloat(va.replace(/[$BMK]/g, '')), vb = parseFloat(vb.replace(/[$BMK]/g, ''));
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
  // Preserve first "All" chip, remove rest
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
      <p>Fetching live yields from DefiLlama...</p>
    </td></tr>`;
    return;
  }

  if (fetchError && yieldData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
      <p style="color:var(--accent-red)">Failed to fetch data: ${escapeHtml(fetchError)}</p>
      <button class="retry-btn" onclick="loadData(true)">🔄 Retry</button>
    </td></tr>`;
    return;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>
      </svg>
      <p>No results matching your filters</p>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(row => {
    const apyClass = row.apy > 10 ? 'apy-high' : row.apy > 5 ? 'apy-mid' : 'apy-positive';
    const ilLabel = row.ilRisk === 'yes' ? ' ⚠️IL' : '';
    const rewardStr = row.apyReward > 0.1 ? ` <span class="reward-hint">(+${row.apyReward.toFixed(1)}% rewards)</span>` : '';
    return `<tr style="cursor:pointer" onclick="window.open('${escapeAttr(row.url)}', '_blank')" title="View on DefiLlama">
      <td><div class="protocol-cell">
        <div class="protocol-icon" style="background:${row.icon}">${row.protocol[0]?.toUpperCase() || '?'}</div>
        <div>
          <span style="font-weight:600">${escapeHtml(row.protocol)}</span>
          ${row.poolMeta ? `<span style="color:var(--text-muted);font-size:0.75rem;display:block">${escapeHtml(row.poolMeta)}</span>` : ''}
        </div>
      </div></td>
      <td><span style="font-family:'JetBrains Mono',monospace;font-size:0.8rem">${row.asset}</span></td>
      <td><span class="chain-badge">${row.chain}</span></td>
      <td><span style="color:var(--text-secondary)">${row.type}${ilLabel}</span></td>
      <td><span class="apy-cell ${apyClass}">${row.apy.toFixed(2)}%${rewardStr}</span></td>
      <td><span class="tvl-cell">${row.tvl}</span></td>
      <td><span class="risk-badge ${row.risk.toLowerCase()}">${row.risk}</span></td>
      <td><span class="external-link-icon" title="Open in DefiLlama">↗</span></td>
    </tr>`;
  }).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
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

// ── Refresh ──
function bindRefresh() {
  const btn = document.getElementById('refreshBtn');
  if (btn) {
    btn.addEventListener('click', () => loadData(true));
  }
}

// ── Loading state ──
function updateLoadingState() {
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    if (isLoading) {
      refreshBtn.classList.add('spinning');
      refreshBtn.disabled = true;
    } else {
      refreshBtn.classList.remove('spinning');
      refreshBtn.disabled = false;
    }
  }
}

function updateTimestamp() {
  const el = document.getElementById('updateTime');
  if (!el) return;

  if (isLoading) {
    el.textContent = '🔄 Fetching...';
    el.className = 'update-badge updating';
    return;
  }

  if (lastFetchTime) {
    const diff = Math.floor((Date.now() - lastFetchTime) / 1000);
    const ago = diff < 60 ? `${diff}s ago` :
      diff < 3600 ? `${Math.floor(diff / 60)}m ago` :
      `${Math.floor(diff / 3600)}h ago`;
    el.textContent = `🟢 Live • ${ago}`;
    el.className = 'update-badge live';
  } else {
    el.textContent = 'No data';
    el.className = 'update-badge';
  }
}

// ── Auto-refresh ──
setInterval(() => {
  if (document.visibilityState === 'visible') {
    loadData(); // uses cache if fresh, fetches if stale
  }
}, POLL_INTERVAL);

// ── Wallet Connection ──
let walletAddress = null;
let walletProvider = null;

window.connectWallet = async function() {
  if (walletAddress) {
    // Disconnect
    walletAddress = null;
    walletProvider = null;
    updateWalletUI();
    return;
  }

  try {
    // Check for injected provider (MetaMask, Rabby, etc.)
    if (window.ethereum) {
      walletProvider = window.ethereum;
      const accounts = await walletProvider.request({ method: 'eth_requestAccounts' });
      walletAddress = accounts[0];

      // Listen for account changes
      walletProvider.on('accountsChanged', (accounts) => {
        walletAddress = accounts.length > 0 ? accounts[0] : null;
        updateWalletUI();
      });

      walletProvider.on('chainChanged', () => {
        window.location.reload();
      });

      updateWalletUI();
    } else {
      alert('Please install a Web3 wallet (MetaMask, Rabby, etc.) to connect.');
    }
  } catch (err) {
    console.error('Wallet connection failed:', err);
    if (err.code === 4001) {
      alert('Connection rejected. Click "Connect Wallet" to try again.');
    } else {
      alert('Failed to connect: ' + err.message);
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
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="15" r="1"/></svg> Connect Wallet`;
    btn.classList.remove('connected');
  }
}