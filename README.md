<div align="center">
  <img src="logo.svg" width="100%">
  <h1>StarIPToolbox - IP工具箱</h1>
</div>

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)

**一个界面精美的纯前端IP工具集合**

<<<<<<< HEAD
[在线体验](https://iptools.xingling.tech) | [功能列表](## 功能特性) | [快速开始](## 快速开始)
=======
[在线体验](https://iptools.xingling.tech) | [功能列表](#功能特性) | [快速开始](#快速开始)
>>>>>>> 0729841 (Release V1.0.0)

</div>

---

## 项目简介

StarIPToolbox 是一个完全运行在浏览器端的IP工具集合，提供18+种专业工具，无需后端服务器，所有数据处理均在本地完成，充分保护用户隐私。项目采用现代化的技术栈，提供流畅的用户体验和精美的毛玻璃UI设计。


---

## 功能特性

### 网络测试工具

#### 1. 代理测试器

- 批量测试代理可用性和延迟
- 支持HTTP/HTTPS/SOCKS4/SOCKS5协议
- 支持多种代理格式解析
- 从URL导入代理列表（支持CORS的源）
- 实时进度显示
- 可筛选和复制测试结果

#### 2. 我的IP信息

- 自动检测当前公网IP
- 显示地理位置信息
- ISP信息展示
- ASN查询

#### 3. IP/域名查询

- IP地址详细信息查询
- 域名解析（支持DoH）
- 地理位置定位
- ISP和ASN信息
- WHOIS数据展示

### 隐私与安全工具

#### 4. 浏览器环境/匿名性测试

完整的浏览器指纹检测系统：

- **WebRTC泄露检测** - 检测真实IP是否通过WebRTC暴露
- **IP一致性检测** - 验证多个来源返回的IP是否一致
- **时区语言匹配** - 检查浏览器设置与地理位置是否匹配
- **Canvas指纹检测** - 测试Canvas渲染唯一性
- **字体指纹检测** - 检测系统安装的字体
- **硬件属性检测** - 收集屏幕和硬件信息
- 自动评分系统，以报告卡形式呈现结果

#### 5. 邮件头分析器 

- 分析电子邮件原始头部信息
- 追踪邮件传输路径
- 提取发件人IP地址
- 检查身份验证记录（SPF、DKIM、DMARC）
- 可视化显示每一跳服务器信息

### 网络工具集

#### 6. 子网计算器

- **IPv4支持** - 完整的IPv4子网计算
- **IPv6支持** - 支持IPv6子网计算（0-128位CIDR）
- 计算网络地址、广播地址
- 首个/最后可用主机
- 子网掩码和通配符掩码
- 二进制表示
- 主机数量统计

#### 7. IP地址转换器

- 点分十进制 ↔ 整数
- 点分十进制 ↔ 十六进制
- 点分十进制 ↔ 二进制
- 实时转换，多格式输出

#### 8. MAC地址生成器

- 随机生成MAC地址
- 支持常见厂商前缀
- 批量生成
- 一键复制

### 开发者工具

#### 9. URL解析器 

- 将URL解析为各个组成部分
- 提取协议、主机名、端口、路径等
- 单独展示查询参数
- 支持用户名密码认证URL
- 一键复制各组件

#### 10. Punycode转换器 

- 国际化域名（IDN）↔ Punycode 双向转换
- 支持多语言域名（中文、日文、德文、俄文等）
- 内置示例快速体验
- 实时转换显示

#### 11. 哈希/编码工具

- **哈希算法**: SHA-1, SHA-256, SHA-384, SHA-512
- **编码**: Base64, URL编码, 十六进制
- **解码**: Base64, URL解码
- 实时计算，一键复制

### 高级工具

#### 12. IPv6工具集

- **压缩/展开** - IPv6地址格式转换
- **IPv4到IPv6映射** - 支持3种映射格式
- **验证和分析** - 地址类型识别（Global/Link-Local/Unique Local/Multicast/Loopback）
- **作用域检测** - 识别地址作用域
- **二进制表示** - 显示二进制格式
- **规范格式化** - 转换为规范格式

#### 13. 批量IP生成器

三种生成模式：

- **CIDR模式** - 生成完整网段（限制10,000个）
- **范围模式** - 指定起始和结束IP（限制10,000个）
- **随机模式** - 生成随机IP地址（限制1,000个）

导出选项：

- TXT格式
- CSV格式
- 一键复制

#### 14. 服务器屏蔽规则生成器

支持5种服务器/防火墙类型：

- **Apache** (.htaccess格式)
- **Nginx** (nginx.conf格式)
- **iptables** (Linux防火墙)
- **firewalld** (RHEL/CentOS)
- **Windows防火墙** (netsh命令)

自动生成正确格式的规则，带详细使用说明

#### 15. DNS记录可视化

- 查询多种DNS记录类型（A, AAAA, CNAME, MX, TXT, NS）
- 使用Cloudflare DoH API
- 可视化展示查询结果
- 显示TTL信息

#### 16. WebSocket测试工具

- 连接任意WebSocket服务器
- 实时发送和接收消息
- 消息历史记录
- 连接状态显示
- 支持ws://和wss://协议

#### 17. HTTP头部检查器

- 检查HTTP响应状态码
- 显示完整响应头
- 重定向链跟踪
- CORS兼容性检测

---

## 快速开始

### 在线使用

直接访问：[https://stargazing-studio.github.io/StarProxyTestTool/](https://stargazing-studio.github.io/StarProxyTestTool/)

### 本地开发

#### 环境要求

- Node.js >= 18
- npm >= 9

#### 安装步骤

```bash
# 克隆项目
git clone https://github.com/Stargazing-Studio/StarProxyTestTool.git
cd StarProxyTestTool

# 安装依赖
npm install

# 配置环境变量（可选）
cp .env.example .env
# 编辑 .env 文件，配置背景图片API

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

#### 环境变量配置

项目支持自定义背景图片。创建 `.env` 文件并配置：

```bash
# 背景图片API地址（可选）
# 留空则使用默认渐变背景
VITE_WALLPAPER_API_URL=

# 示例：使用必应壁纸
# VITE_WALLPAPER_API_URL=https://your-bing-wallpaper-api.com/
```

**推荐的背景图片服务**：
- [Bing Wallpaper API](https://github.com/SunXin121/bing_wallpaper) - 提供必应每日壁纸

如果不配置背景图片API，应用将使用渐变色背景。

#### 部署到GitHub Pages

```bash
# 构建并部署
npm run deploy
```


## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用TypeScript编写
- 遵循ESLint规则
- 保持代码简洁清晰
- 添加必要的注释

### 添加新功能

如果您想添加新功能，请确保：

1. 功能是纯前端实现
2. 添加完整的i18n支持（zh.json 和 en.json）
3. 在 Layout.tsx 中添加导航菜单项
4. 在 App.tsx 中配置路由
5. 更新 README.md 的功能列表

---

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 作者

**Stargazing Studio - XingLingQAQ - AI**

- GitHub: [@Stargazing-Studio](https://github.com/Stargazing-Studio)
- 项目链接: [StarProxyTestTool](https://github.com/Stargazing-Studio/StarProxyTestTool)

---

## 致谢

- AI工具
- [Bing Wallpaper API](https://github.com/SunXin121/bing_wallpaper) - 背景图片服务
- 感谢所有贡献者
- 感谢开源社区
- 特别感谢使用本工具的每一位用户

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！

---

## 隐私声明

本项目完全在浏览器端运行，不会向任何服务器发送您的数据：

- ✅ 所有计算和处理都在本地完成
- ✅ 不收集任何用户信息
- ✅ 不使用任何追踪代码
- ✅ 不依赖第三方数据收集服务
- ✅ 开源透明，代码可审计

唯一的外部请求：
- 背景图片加载（如果配置了VITE_WALLPAPER_API_URL）
- IP查询功能使用的公共API（ipapi.co, ipify.org等）
- DNS查询使用Cloudflare DoH

---

<div align="center">

Made with ❤️ by Stargazing Studio

[返回顶部](#stariptoolbox---ip工具箱)

</div>
