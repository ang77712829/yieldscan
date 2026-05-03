# 更新日志

## v3.1 (2026-05-03)

### Bug 修复
- **TVL 排序数学错误**：`$1.5B` 和 `$500M` 的排序比较未乘以 B/M/K 倍数，导致 500M 被认为大于 1.5B，已修复
- **统计卡片 TypeError**：`?.apy.toFixed(2)` 缺少中间保护，USDT 池不存在时抛出 TypeError，已修复
- **stablecoin 字段逻辑错误**：`p.stablecoin || true` 永远返回 true，改为 `!!p.stablecoin`
- **重复 `renderAll` 调用**：`setLang` 末尾调用 `renderAll` 导致首次加载执行两次，已移除

### 安全改进
- **消除 innerHTML XSS 风险**：添加安全注释，确认 i18n 文本为硬编码静态对象
- **消除 onclick URL 注入风险**：inline `onclick` 改为 `addEventListener` + `data-url` 属性

### 数据质量
- **稳定币匹配增强**：支持 `USDC.e` 等桥接版本符号
- **风险评估增强**：结合 TVL（<$1M → Medium）、APY（>50% → High）、审计状态综合判断

### 项目规范
- 添加 `.gitignore` 和 MIT `LICENSE`
- 更新 README：移除不存在的截图引用、标记已完成的 Roadmap 项、更新链和协议数量

---

## v3.0 (2026-05-02) — i18n 多语言支持
- 支持 6 种语言：EN/ZH/JA/KO/ES/PT

## v2.0 (2026-05-02) — Live API 集成
- 接入 DefiLlama 真实数据 + 钱包连接 + 本地缓存

## v1.0 (2026-05-02) — 初始版本
