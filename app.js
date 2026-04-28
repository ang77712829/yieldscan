// ── Mock Data: 2026 DeFi Stablecoin Yields ──
const yieldData = [
  { protocol: "Aave V3",        icon: "#B6509E", asset: "USDC", chain: "Ethereum",   type: "Lending", apy: 4.82, tvl: "2.84B", risk: "Low"    },
  { protocol: "Aave V3",        icon: "#B6509E", asset: "USDT", chain: "Ethereum",   type: "Lending", apy: 4.35, tvl: "1.92B", risk: "Low"    },
  { protocol: "Aave V3",        icon: "#B6509E", asset: "USDC", chain: "Arbitrum",   type: "Lending", apy: 6.15, tvl: "890M",  risk: "Low"    },
  { protocol: "Compound V3",    icon: "#00D395", asset: "USDC", chain: "Ethereum",   type: "Lending", apy: 4.10, tvl: "1.56B", risk: "Low"    },
  { protocol: "Compound V3",    icon: "#00D395", asset: "USDT", chain: "Ethereum",   type: "Lending", apy: 3.72, tvl: "980M",  risk: "Low"    },
  { protocol: "Morpho Blue",    icon: "#2463EB", asset: "USDC", chain: "Ethereum",   type: "Lending", apy: 5.90, tvl: "1.14B", risk: "Medium" },
  { protocol: "Spark (Maker)",  icon: "#F5A623", asset: "USDC", chain: "Ethereum",   type: "Lending", apy: 4.55, tvl: "740M",  risk: "Low"    },
  { protocol: "Curve Finance",  icon: "#EF4444", asset: "USDC", chain: "Ethereum",   type: "DEX",     apy: 3.20, tvl: "1.34B", risk: "Low"    },
  { protocol: "Curve Finance",  icon: "#EF4444", asset: "USDT", chain: "Arbitrum",   type: "DEX",     apy: 5.75, tvl: "420M",  risk: "Low"    },
  { protocol: "Uniswap V3",     icon: "#FF007A", asset: "USDC", chain: "Ethereum",   type: "DEX",     apy: 8.40, tvl: "650M",  risk: "Medium" },
  { protocol: "Uniswap V3",     icon: "#FF007A", asset: "USDC", chain: "Arbitrum",   type: "DEX",     apy: 9.20, tvl: "380M",  risk: "Medium" },
  { protocol: "Uniswap V3",     icon: "#FF007A", asset: "USDC", chain: "Optimism",   type: "DEX",     apy: 7.80, tvl: "210M",  risk: "Medium" },
  { protocol: "Pendle Finance", icon: "#8B5CF6", asset: "USDC", chain: "Ethereum",   type: "Yield",   apy: 12.60,tvl: "540M",  risk: "High"   },
  { protocol: "Ethena (sUSDe)", icon: "#6366F1", asset: "USDC", chain: "Ethereum",   type: "Yield",   apy: 11.50,tvl: "2.10B", risk: "High"   },
  { protocol: "Ethena (sUSDe)", icon: "#6366F1", asset: "USDT", chain: "Ethereum",   type: "Yield",   apy: 10.80,tvl: "1.40B", risk: "High"   },
  { protocol: "Fluid (Instadapp)",icon: "#3B82F6",asset: "USDC", chain: "Ethereum",   type: "Lending", apy: 6.45, tvl: "320M",  risk: "Medium" },
  { protocol: "Venus Protocol", icon: "#10B981", asset: "USDT", chain: "BNB Chain",  type: "Lending", apy: 5.30, tvl: "560M",  risk: "Medium" },
  { protocol: "Aerodrome",      icon: "#06B6D4", asset: "USDC", chain: "Base",       type: "DEX",     apy: 7.15, tvl: "280M",  risk: "Medium" },
  { protocol: "Kamino Finance", icon: "#22C55E", asset: "USDC", chain: "Solana",     type: "Lending", apy: 5.50, tvl: "440M",  risk: "Low"    },
  { protocol: "Drift Protocol", icon: "#F97316", asset: "USDC", chain: "Solana",     type: "Yield",   apy: 8.90, tvl: "180M",  risk: "Medium" },
];

// ── State ──
let filtered = [...yieldData];
let sortKey = "apy";
let sortDir = "desc";
let activeFilters = { risk: "all", chain: "all", type: "all" };

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  bindFilters();
  bindSort();
  updateTimestamp();
});

// ── Render ──
function renderAll() {
  applyFilters();
  applySort();
  updateStats();
  updateChainFilter();
  renderTable();
}

function applyFilters() {
  filtered = yieldData.filter(row => {
    if (activeFilters.risk !== "all" && row.risk !== activeFilters.risk) return false;
    if (activeFilters.chain !== "all" && row.chain !== activeFilters.chain) return false;
    if (activeFilters.type !== "all" && row.type !== activeFilters.type) return false;
    return true;
  });
}

function applySort() {
  filtered.sort((a, b) => {
    let va = a[sortKey], vb = b[sortKey];
    if (typeof va === "string") va = va.toLowerCase(), vb = vb.toLowerCase();
    if (sortDir === "asc") return va > vb ? 1 : -1;
    return va < vb ? 1 : -1;
  });
}

function updateStats() {
  const usdtRows = yieldData.filter(r => r.asset === "USDT");
  const usdcRows = yieldData.filter(r => r.asset === "USDC");
  document.getElementById("bestUsdt").textContent = usdtRows.length
    ? Math.max(...usdtRows.map(r => r.apy)).toFixed(2) + "%" : "—";
  document.getElementById("bestUsdc").textContent = usdcRows.length
    ? Math.max(...usdcRows.map(r => r.apy)).toFixed(2) + "%" : "—";
  document.getElementById("protoCount").textContent =
    [...new Set(yieldData.map(r => r.protocol))].length;
  document.getElementById("avgApy").textContent =
    (yieldData.reduce((s, r) => s + r.apy, 0) / yieldData.length).toFixed(2) + "%";
}

function updateChainFilter() {
  const chains = [...new Set(yieldData.map(r => r.chain))];
  const container = document.getElementById("chainFilter");
  container.querySelectorAll(".chip:not(:first-child)").forEach(c => c.remove());
  chains.forEach(chain => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.dataset.value = chain;
    btn.textContent = chain;
    btn.addEventListener("click", () => toggleFilter("chain", btn, container));
    container.appendChild(btn);
  });
}

function renderTable() {
  const tbody = document.getElementById("tableBody");
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>
      </svg>
      <p>No results matching your filters</p></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(row => {
    const apyClass = row.apy > 8 ? "apy-high" : "apy-positive";
    return `<tr>
      <td><div class="protocol-cell">
        <div class="protocol-icon" style="background:${row.icon}">${row.protocol[0]}</div>
        <span style="font-weight:600">${row.protocol}</span>
      </div></td>
      <td><span style="font-family:'JetBrains Mono',monospace;font-size:0.8rem">${row.asset}</span></td>
      <td><span class="chain-badge">${row.chain}</span></td>
      <td><span style="color:var(--text-secondary)">${row.type}</span></td>
      <td><span class="apy-cell ${apyClass}">${row.apy.toFixed(2)}%</span></td>
      <td><span class="tvl-cell">$${row.tvl}</span></td>
      <td><span class="risk-badge ${row.risk.toLowerCase()}">${row.risk}</span></td>
    </tr>`;
  }).join("");
}

// ── Filters ──
function bindFilters() {
  document.getElementById("riskFilter").addEventListener("click", e => {
    if (e.target.classList.contains("chip")) toggleFilter("risk", e.target, e.currentTarget);
  });
  document.getElementById("chainFilter").addEventListener("click", e => {
    if (e.target.classList.contains("chip")) toggleFilter("chain", e.target, e.currentTarget);
  });
  document.getElementById("typeFilter").addEventListener("click", e => {
    if (e.target.classList.contains("chip")) toggleFilter("type", e.target, e.currentTarget);
  });
}

function toggleFilter(name, btn, container) {
  container.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  activeFilters[name] = btn.dataset.value;
  renderAll();
}

// ── Sort ──
function bindSort() {
  document.querySelectorAll(".sortable").forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (sortKey === key) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortKey = key;
        sortDir = key === "apy" ? "desc" : "asc";
      }
      // Update sort icons
      document.querySelectorAll(".sortable .sort-icon").forEach(icon => icon.textContent = "");
      const icon = th.querySelector(".sort-icon");
      if (icon) icon.textContent = sortDir === "asc" ? "↑" : "↓";
      renderAll();
    });
  });
}

function updateTimestamp() {
  const now = new Date();
  const str = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  document.getElementById("updateTime").textContent = "Updated " + str;
}