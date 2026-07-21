# Arch Linux Web Simulator

基于 Web 的 Arch Linux 桌面环境模拟器，支持 60+ 应用程序。

## 快速启动

### 方式一：直接运行（推荐）

需要安装 [Node.js](https://nodejs.org/)（版本 18+）

```bash
# 安装 Electron
npm install electron --save-dev

# 启动
npx electron electron/main.js
```

### 方式二：用浏览器打开

直接用浏览器打开 `dist/index.html` 文件即可。

### 方式三：部署到 Web 服务器

将 `dist` 目录下的所有文件放到 Web 服务器的根目录即可。

## 打包成桌面应用

### Windows (.exe)
```bash
npm install electron-builder --save-dev
npx electron-builder --win
```

### macOS (.dmg)
```bash
npm install electron-builder --save-dev
npx electron-builder --mac
```

### Linux (.AppImage / .deb)
```bash
npm install electron-builder --save-dev
npx electron-builder --linux
```

## 功能特性

- **60+ 应用**：浏览器、网易云音乐、OBS、VS Code、终端、游戏等
- **Hyprland 风格**：毛玻璃效果、动画、圆角窗口
- **完整窗口管理**：拖拽、最大化、最小化、关闭
- **锁屏/开机**：真实 Linux 启动日志、锁屏密码保护
- **响应式**：适配手机、平板、电脑
- **真实硬件检测**：电池状态、CPU 信息、屏幕分辨率

## 密码

锁屏密码：`arch`

## 技术栈

React 18 + TypeScript + Vite + Tailwind CSS + Electron

## 许可证

仅供学习娱乐
