# 🧬 YieldScan — DeFi Stablecoin Yield Aggregator

A single-page dashboard that compares real-time USDT and USDC yields across major DeFi protocols. Built with pure HTML/CSS/JS — no frameworks, no build step.

## ✨ Features

- 📊 Compare USDT/USDC yields across **30+ positions** from **30+ protocols**
- 🎛️ Filter by **risk level** (Low / Medium / High), **chain**, and **protocol type**
- 📈 Sort by APY, TVL, or any column
- 🌐 Multi-chain coverage: Ethereum, Arbitrum, Optimism, Base, Solana, Polygon, Avalanche, BNB Chain
- 🎨 Dark-themed UI with glassmorphism cards and gradient accents
- 📱 Fully responsive — works on mobile, tablet, and desktop
- 🔌 "Connect Wallet" button ready for Web3 integration

## 🛠️ Tech Stack

- **HTML5** — semantic structure
- **CSS3** — custom properties, glassmorphism, backdrop filters, grid/flexbox
- **JavaScript (ES6+)** — dynamic rendering, filtering, sorting
- **Google Fonts** — Inter + JetBrains Mono

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/ang77712829/yieldscan.git
cd yieldscan

# Just open index.html in your browser
open index.html
```

No `npm install`, no build tools. Works straight out of the box.

## 📁 Project Structure

```
yieldscan/
├── index.html    # Main page with dark theme & glassmorphism UI
├── styles.css    # All styling — CSS custom properties, responsive breakpoints
├── app.js        # Data model, filtering, sorting, rendering logic
└── README.md     # You are here
```

## 📈 Tracked Protocols

| Protocol | Type | Chains |
|---|---|---|
| Aave V3 | Lending | Ethereum, Arbitrum |
| Compound V3 | Lending | Ethereum |
| Morpho Blue | Lending | Ethereum |
| Spark (Maker) | Lending | Ethereum |
| Curve Finance | DEX LP | Ethereum, Arbitrum |
| Uniswap V3 | DEX LP | Ethereum, Arbitrum, Optimism |
| Pendle Finance | Yield | Ethereum |
| Ethena (sUSDe) | Yield | Ethereum |
| Fluid (Instadapp) | Lending | Ethereum |
| Venus Protocol | Lending | BNB Chain |
| Aerodrome | DEX LP | Base |
| Kamino Finance | Lending | Solana |
| Drift Protocol | Yield | Solana |

## 🔮 Roadmap

- [x] Live API integration (DefiLlama)
- [x] Wallet connection (MetaMask / injected)
- [ ] One-click deposit into best-yield pools
- [ ] Historical APY charts
- [ ] Yield strategy builder with risk scoring

## ⚠️ Disclaimer

This project is for informational and educational purposes only. APY rates are indicative and change based on market conditions. Not financial advice. Always DYOR.

## 👤 Author

**安歌** ([@ang77712829](https://github.com/ang77712829))

---

*Built with ❤️ as part of Web3 portfolio building*