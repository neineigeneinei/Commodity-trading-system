# 大宗商品交易平台 Commodity Trading Platform

本项目的主要技术路线是react+node.js+express+MySQL完成基本前后端，实现了基本的交易平台买卖功能，且通过部署智能合约完成区块链的集成，实现了信息的链上透明性和交易可追溯性，保证了交易更可靠和安全。

🌍 基于分布式架构的现代化大宗商品交易解决方案，涵盖能源、金属、农产品等品类交易，提供从挂牌撮合到供应链金融的全流程服务。

📚 [API 文档](https://api.commodity.demo.com) | 📧 商务合作 contact@commodity.com

![交易平台界面截图](docs/screenshot.png)

## 核心功能

### 🚀 交易引擎
- 多维度商品挂牌（现货/期货/期权）
- 智能订单撮合引擎（FOK/IOC/限价单）
- 实时市场深度数据（L2行情推送）
- 跨市场套利预警系统

### ⚡ 实时系统
- 分布式订单簿处理（Kafka+Redis集群）
- 毫秒级交易响应（<50ms 延迟）
- 多数据中心灾备（异地多活架构）
- 交易终端WebSocket支持

### 🔐 风控体系
- 实时保证金监控
- 黑天鹅事件熔断机制
- 反市场操纵检测模型
- 多级KYC/AML验证流程

### 📦 供应链集成
- 智能仓储物联监控
- 物流轨迹区块链存证
- 电子仓单质押融资
- 跨境结算通道对接

## 技术架构

```mermaid
graph TD
    A[交易终端] --> B{Nginx 7层负载}
    B --> C[Spring Cloud Gateway]
    C --> D[认证中心]
    C --> E[订单服务集群]
    C --> F[清算服务集群]
    E --> G[RabbitMQ 订单队列]
    F --> H[PostgreSQL 财务库]
    G --> I[撮合引擎核心]
    I --> J[Redis 行情缓存]
    J --> K[Kafka 数据管道]
    K --> L[大数据分析平台]
