# 李志添 & 甘慧珊 · 新婚祝福网页 💍✨

一个为新人「李志添 & 甘慧珊」量身打造的精美婚礼祝福网页。全新设计、无故事线叙述，仅以优雅动画与互动呈现真挚祝福。

## 🧾 项目概述

- 纯前端单页面：直接打开即可使用
- 精美动画：烟花、彩带、心形粒子、花瓣飘落、柔光渐变
- 互动体验：一键庆祝、音乐开关、祝福语轮播
- 响应式设计：手机、平板、桌面皆优雅适配

## ✨ 主要功能

- 庆祝动画：点击「开始庆祝」触发烟花与彩带效果
- 背景动画：渐变星光、柔光脉动、花瓣/爱心缓慢飘落
- 祝福语轮播：循环呈现祝福文案，支持自定义
- 音乐播放：背景婚礼音乐；若音频不可用，自动合成柔和伴奏
- 渐入效果：内容滚动时优雅出现

## 📦 使用方式

### 方式一：直接打开（推荐）
直接双击或在浏览器中打开 `index.html`。

### 方式二：本地开发（可选）
如需使用 webpack 开发服务器：

```powershell
npm install
npm run dev
```

构建生产版本：
```powershell
npm run build
```

> 现代浏览器（Chrome/Edge/Firefox/Safari）体验最佳。

## 🗂 项目结构

```
Wedding-wishes-for-GHS-LZT/
├── index.html        # 主页面（全新设计）
├── styles.css        # 样式与CSS动画
├── script.js         # 动画控制与交互逻辑
├── assets/
│   └── audio/
│       └── wedding-music.mp3  # 可选：背景音乐文件
├── package.json      # 可选：开发与构建脚本
├── webpack.config.js # 可选：本地开发配置
└── README.md         # 项目说明
```

## 🛠 自定义指南

- 修改祝福文案：在 `script.js` 的 `wishes` 数组中增删即可
- 更换配色/动画强度：在 `styles.css` 中调整 CSS 变量与关键帧
- 更换音乐：将音频文件置于 `assets/audio/wedding-music.mp3`，或保持自动合成模式

## 🚀 部署

将这三个文件 `index.html`、`styles.css`、`script.js` 与资源目录 `assets/` 上传至任意静态托管（GitHub Pages、Vercel、Netlify等）即可。

## ❤️ 寄语

愿「李志添 & 甘慧珊」新婚快乐、相伴一生。
愿你们的每一天都被温柔与光照亮。