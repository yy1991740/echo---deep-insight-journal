# Echo - 深度洞察日记 (Deep Insight Journal)

**Echo** 是一个次世代的日记助手，旨在捕捉你的思绪并重构你的“数字灵魂”。

与传统日记不同，Echo 采用 **双系统 AI 架构 (Dual-System AI Architecture)**，既能提供即时的情感支持，又能进行深度的心理分析。它结合了“深空”美学与高端排版，为你提供沉浸式的疗愈体验。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-teal)

## ✨ 核心功能

*   **🧠 双模 AI 分析系统**：
    *   **快系统 (Flash)**：提供即时、共情、极具人性化的反馈，像老朋友一样安抚你的情绪。
    *   **慢系统 (Thinking)**：在后台进行深度心理侧写，提取“情绪原子”、“深度洞察”，并生成极具文学性的“永生箴言”。
*   **🎙️ 语音 & 文字双模输入**：
    *   集成 Web Speech API 实现实时语音转文字。
    *   **微信智能降级**：检测到在微信内置浏览器中运行时，自动切换为“文字输入模式”，确保可用性。
*   **🔮 每日好奇一问**：
    *   AI 扮演一个“充满好奇心的陌生人”，每天向你提出一个具体、意想不到的问题，以此挖掘被遗忘的记忆碎片。
*   **🎴 高定级心流卡片 (Insight Card)**：
    *   为每条日记生成一张“黑曜石 & 烫金”风格的收藏级卡片。
    *   **解密交互**：深度心理分析默认隐藏，点击“指纹解密”后才会浮现，充满仪式感。
    *   **一键保存/分享**：针对移动端优化（使用 Web Share API），解决 iOS/Android 兼容性问题，生成的图片自带高级噪点纹理和光效。
*   **🌍 双语支持**：无缝切换中文 (CN) 和英文 (EN) 模式。
*   **🌌 沉浸式 UI**：采用“静谧博物馆”美学，包含胶片噪点、玻璃拟态和高端衬线字体排版。

## 🛠️ 技术栈

*   **框架**: React 18, TypeScript, Next.js (App Router)
*   **样式**: Tailwind CSS, Lucide React (图标)
*   **字体**: Noto Serif SC, Playfair Display, Inter (通过 Google Fonts 引入)
*   **AI 服务**: 火山引擎 (豆包) API (服务端安全调用)
*   **工具**: html2canvas (图片生成)

## 🚀 快速开始

### 前置要求

1.  **Node.js** (v18 或更高版本)
2.  **火山引擎账号** (Volcengine): 你需要获取 API Key 和两个模型接入点 (Endpoint)。

### 安装步骤

1.  **克隆项目**
    ```bash
    git clone https://github.com/your-username/echo-journal.git
    cd echo-journal
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置环境变量 (至关重要!)**
    在项目根目录创建一个 `.env` 文件（或者在你的部署平台如 Vercel 中配置）。
    
    > **⚠️ 注意**：必须使用以 `ep-` 开头的 **接入点 ID (Endpoint ID)**，**不要**填模型名称（如 Doubao-pro-4k）。
    
    ```env
    # 你的火山引擎 API Key (仅在服务端使用，安全)
    DOUBAO_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

    # 高速模型接入点 ID (建议使用 Doubao-pro-4k 或 Doubao-lite)
    # 用于：即时反馈、每日一问
    NEXT_PUBLIC_FLASH_EP=ep-202xxxxxxxx-xxxxxx

    # 推理模型接入点 ID (建议使用 Doubao-pro-32k 或 Doubao-pro-128k)
    # 用于：深度心理分析、JSON 生成
    NEXT_PUBLIC_THINKING_EP=ep-202xxxxxxxx-xxxxxx
    ```

4.  **启动本地开发服务器**
    ```bash
    npm run dev
    ```

## 📦 部署指南 (Vercel)

本项目完全兼容 Vercel 部署，并利用了 Next.js 的 API Routes 功能。

1.  将代码推送到 GitHub 仓库。
2.  在 Vercel 中导入该项目 (Framework Preset 会自动识别为 Next.js)。
3.  **配置环境变量**：在 Vercel 项目设置 (Settings -> Environment Variables) 中，添加上述三个变量：
    *   `DOUBAO_API_KEY`
    *   `NEXT_PUBLIC_FLASH_EP`
    *   `NEXT_PUBLIC_THINKING_EP`
4.  点击 Deploy。

## 🔑 如何获取火山引擎 ID

1.  前往 [火山引擎方舟控制台](https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint)。
2.  点击 **创建推理接入点**。
3.  选择模型（推荐：Flash 用 `Doubao-pro-4k`，Thinking 用 `Doubao-pro-32k`）。
4.  复制生成的以 `ep-` 开头的 ID。**请勿直接使用模型名称。**

## 📱 移动端与微信兼容性说明

*   **微信环境**：应用会自动检测是否在微信中运行。由于微信浏览器屏蔽了 Web Speech API（录音功能），应用会自动切换到 **文字输入模式** 并隐藏录音按钮，确保用户依然可以记录心流。
*   **iOS/Android 保存图片**：使用原生 **Web Share API**，在点击“保存记忆”时直接调起系统的分享面板，支持直接发送给微信好友或保存到相册，解决了传统下载在手机上失效的问题。

## 📄 许可证

MIT License.
