<div align="center">
  <img src="logo.svg" width="100%">
  <h1>StarIPToolbox - IP Toolbox</h1>
</div>

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)

**A beautiful collection of pure frontend IP tools**

[Live Demo](https://iptools.stargazingstudio.site/) | [Features](#features) | [Quick Start](#quick-start)

[![中文](https://img.shields.io/badge/Language-%E4%B8%AD%E6%96%87-red?style=for-the-badge)](README_zh.md)

</div>

---

## Introduction

StarIPToolbox is a comprehensive IP toolkit that runs entirely in the browser. It provides 18+ professional tools without requiring a backend server. All data processing is done locally, ensuring complete privacy protection. Built with modern technology stack, it offers a smooth user experience with beautiful glassmorphism UI design.

---

## Features

### Network Testing Tools

#### 1. Proxy Tester

- Batch test proxy availability and latency
- Support for HTTP/HTTPS/SOCKS4/SOCKS5 protocols
- Multiple proxy format parsing
- Import proxy lists from URLs (CORS-enabled sources)
- Real-time progress display
- Filter and copy test results

#### 2. My IP Information

- Automatically detect current public IP
- Display geolocation information
- ISP information display
- ASN lookup

#### 3. IP/Domain Lookup

- Detailed IP address information query
- Domain resolution (DoH support)
- Geolocation mapping
- ISP and ASN information
- WHOIS data display

### Privacy & Security Tools

#### 4. Browser Environment/Anonymity Test

Complete browser fingerprinting detection system:

- **WebRTC Leak Detection** - Check if real IP is exposed through WebRTC
- **IP Consistency Check** - Verify if IPs from multiple sources match
- **Timezone Language Matching** - Check if browser settings match geolocation
- **Canvas Fingerprint Detection** - Test Canvas rendering uniqueness
- **Font Fingerprint Detection** - Detect installed system fonts
- **Hardware Attributes Detection** - Collect screen and hardware information
- Automatic scoring system with report card presentation

#### 5. Email Header Analyzer

- Analyze raw email header information
- Track email transmission path
- Extract sender IP addresses
- Check authentication records (SPF, DKIM, DMARC)
- Visualize information for each hop server

### Network Utilities

#### 6. Subnet Calculator

- **IPv4 Support** - Complete IPv4 subnet calculation
- **IPv6 Support** - IPv6 subnet calculation (0-128 bit CIDR)
- Calculate network address, broadcast address
- First/last usable host
- Subnet mask and wildcard mask
- Binary representation
- Host count statistics

#### 7. IP Address Converter

- Dotted decimal ↔ Integer
- Dotted decimal ↔ Hexadecimal
- Dotted decimal ↔ Binary
- Real-time conversion, multiple format output

#### 8. MAC Address Generator

- Generate random MAC addresses
- Support for common vendor prefixes
- Batch generation
- One-click copy

### Developer Tools

#### 9. URL Parser

- Parse URLs into components
- Extract protocol, hostname, port, path, etc.
- Display query parameters separately
- Support for username/password authentication URLs
- One-click copy for each component

#### 10. Punycode Converter

- Internationalized Domain Name (IDN) ↔ Punycode bidirectional conversion
- Support for multilingual domain names (Chinese, Japanese, German, Russian, etc.)
- Built-in examples for quick testing
- Real-time conversion display

#### 11. Hash/Encoding Tool

- **Hash Algorithms**: SHA-1, SHA-256, SHA-384, SHA-512
- **Encoding**: Base64, URL encoding, Hexadecimal
- **Decoding**: Base64, URL decoding
- Real-time calculation, one-click copy

### Advanced Tools

#### 12. IPv6 Toolkit

- **Compress/Expand** - IPv6 address format conversion
- **IPv4 to IPv6 Mapping** - Support 3 mapping formats
- **Validation and Analysis** - Address type identification (Global/Link-Local/Unique Local/Multicast/Loopback)
- **Scope Detection** - Identify address scope
- **Binary Representation** - Display in binary format
- **Canonical Formatting** - Convert to canonical format

#### 13. Bulk IP Generator

Three generation modes:

- **CIDR Mode** - Generate complete network segments (limit 10,000)
- **Range Mode** - Specify start and end IP (limit 10,000)
- **Random Mode** - Generate random IP addresses (limit 1,000)

Export options:

- TXT format
- CSV format
- One-click copy

#### 14. Server Block Rules Generator

Support for 5 server/firewall types:

- **Apache** (.htaccess format)
- **Nginx** (nginx.conf format)
- **iptables** (Linux firewall)
- **firewalld** (RHEL/CentOS)
- **Windows Firewall** (netsh commands)

Automatically generate correctly formatted rules with detailed usage instructions

#### 15. DNS Record Visualizer

- Query multiple DNS record types (A, AAAA, CNAME, MX, TXT, NS)
- Uses Cloudflare DoH API
- Visualize query results
- Display TTL information

#### 16. WebSocket Test Tool

- Connect to any WebSocket server
- Send and receive messages in real-time
- Message history
- Connection status display
- Support for ws:// and wss:// protocols

#### 17. HTTP Header Checker

- Check HTTP response status codes
- Display complete response headers
- Track redirect chains
- CORS compatibility detection

---

## Quick Start

### Online Usage

Visit directly: [https://iptools.stargazingstudio.site/](https://iptools.stargazingstudio.site/)

### Local Development

#### Requirements

- Node.js >= 18
- npm >= 9

#### Installation Steps

```bash
# Clone the repository
git clone https://github.com/Stargazing-Studio/StarIPToolBox.git
cd StarProxyTestTool

# Install dependencies
npm install

# Configure environment variables (optional)
cp .env.example .env
# Edit .env file to configure background image API

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Environment Variable Configuration

The project supports custom background images. Create a `.env` file and configure:

```bash
# Background image API URL (optional)
# Leave empty to use default gradient background
VITE_WALLPAPER_API_URL=

# Example: Use Bing wallpaper
# VITE_WALLPAPER_API_URL=https://your-bing-wallpaper-api.com/
```

**Recommended background image services**:
- [Bing Wallpaper API](https://github.com/SunXin121/bing_wallpaper) - Provides Bing daily wallpapers

If no background image API is configured, the application will use a gradient background.

#### Deploy to GitHub Pages

```bash
# Build and deploy
npm run deploy
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Write in TypeScript
- Follow ESLint rules
- Keep code clean and concise
- Add necessary comments

### Adding New Features

If you want to add new features, please ensure:

1. The feature is purely frontend implementation
2. Add complete i18n support (zh.json and en.json)
3. Add navigation menu items in Layout.tsx
4. Configure routes in App.tsx
5. Update the feature list in README.md

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

---

## Authors

**Stargazing Studio - XingLingQAQ - AI**

- GitHub: [@Stargazing-Studio](https://github.com/Stargazing-Studio)
- Project Link: [StarProxyTestTool](https://github.com/Stargazing-Studio/StarIPToolBox)

---

## Acknowledgments

- AI Tools
- [Bing Wallpaper API](https://github.com/SunXin121/bing_wallpaper) - Background image service
- Thanks to all contributors
- Thanks to the open source community
- Special thanks to every user of this tool

If this project helps you, please give it a ⭐ Star!

---

## Privacy Statement

This project runs entirely in the browser and does not send your data to any server:

- ✅ All calculations and processing are done locally
- ✅ No user information is collected
- ✅ No tracking code is used
- ✅ No third-party data collection services
- ✅ Open source and transparent, code is auditable

The only external requests:
- Background image loading (if VITE_WALLPAPER_API_URL is configured)
- Public APIs used for IP lookup (ipapi.co, ipify.org, etc.)
- DNS queries use Cloudflare DoH

---

<div align="center">

Made with ❤️ by Stargazing Studio

[Back to Top](#stariptoolbox---ip-toolbox)

</div>
