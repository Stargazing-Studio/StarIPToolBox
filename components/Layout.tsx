import React, { useState } from "react";
import type { IconType } from "react-icons";
import { Link, useLocation } from "react-router-dom";
import {
  FiActivity,
  FiGlobe,
  FiSearch,
  FiShield,
  FiGrid,
  FiRepeat,
  FiWifi,
  FiHash,
  FiGitBranch,
  FiZap,
  FiInfo,
  FiMenu,
  FiX,
  FiLayers,
  FiServer,
  FiCpu,
  FiGlobe as FiGlobeAlt,
  FiLink,
  FiType,
  FiMail,
} from "react-icons/fi";
import { useLanguage } from "../contexts/LanguageContext";
import logo from "/vite.svg";

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  path: string;
  labelKey: string;
  icon: IconType;
}

const menuItems: MenuItem[] = [
  { path: "/", labelKey: "navigation.proxyTest", icon: FiActivity },
  { path: "/my-ip", labelKey: "navigation.myIp", icon: FiGlobe },
  { path: "/ip-lookup", labelKey: "navigation.ipLookup", icon: FiSearch },
  { path: "/browser-test", labelKey: "navigation.browserTest", icon: FiShield },
  { path: "/subnet-calc", labelKey: "navigation.subnetCalc", icon: FiGrid },
  { path: "/ip-converter", labelKey: "navigation.ipConverter", icon: FiRepeat },
  { path: "/mac-generator", labelKey: "navigation.macGenerator", icon: FiWifi },
  { path: "/hash-tool", labelKey: "navigation.hashTool", icon: FiHash },
  {
    path: "/dns-visualizer",
    labelKey: "navigation.dnsVisualizer",
    icon: FiGitBranch,
  },
  {
    path: "/websocket-test",
    labelKey: "navigation.websocketTest",
    icon: FiZap,
  },
  { path: "/ip-generator", labelKey: "navigation.ipGenerator", icon: FiLayers },
  { path: "/block-rules", labelKey: "navigation.blockRules", icon: FiServer },
  { path: "/ipv6-tools", labelKey: "navigation.ipv6Tools", icon: FiGlobeAlt },
  { path: "/http-checker", labelKey: "navigation.httpChecker", icon: FiCpu },
  { path: "/url-parser", labelKey: "navigation.urlParser", icon: FiLink },
  { path: "/punycode-converter", labelKey: "navigation.punycodeConverter", icon: FiType },
  { path: "/email-header-analyzer", labelKey: "navigation.emailHeaderAnalyzer", icon: FiMail },
  { path: "/about", labelKey: "navigation.about", icon: FiInfo },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  const currentPage = menuItems.find((item) => item.path === location.pathname);

  const toggleLanguage = () => setLanguage(language === "zh" ? "en" : "zh");

  const renderMenuItem = (item: MenuItem, collapsed: boolean) => {
    const IconComponent = item.icon;
    const active = location.pathname === item.path;
    const activeClasses = active
      ? "bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold shadow-md"
      : "text-white/80 hover:bg-white/20";

    if (collapsed) {
      return (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center justify-center rounded-lg transition-all duration-200 ${activeClasses}`}
          style={{ width: "48px", height: "48px" }}
          title={t(item.labelKey)}
          aria-current={active ? "page" : undefined}
        >
          <IconComponent size={20} />
        </Link>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center gap-3 rounded-lg transition-all duration-200 ${activeClasses}`}
        style={{ height: "48px", paddingLeft: "12px", paddingRight: "12px" }}
        title={t(item.labelKey)}
        aria-current={active ? "page" : undefined}
      >
        <div style={{ width: "20px", height: "20px", flexShrink: 0 }}>
          <IconComponent size={20} />
        </div>
        <span className="text-sm truncate">{t(item.labelKey)}</span>
      </Link>
    );
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full h-full">
        {/* Sidebar */}
        <aside
          className="flex-shrink-0 h-full p-8 transition-all duration-300 ease-in-out"
          style={{ width: sidebarCollapsed ? "144px" : "272px" }}
        >
          <div className="h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Logo Header */}
            <div
              className={`flex items-center border-b border-white/20 flex-shrink-0 transition-all duration-300 ${
                sidebarCollapsed ? "justify-center p-4" : "gap-3 p-5"
              }`}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  flexShrink: 0,
                  flexGrow: 0,
                }}
              >
                <img
                  src={logo}
                  alt={t("layout.logoAlt")}
                  style={{
                    width: "36px",
                    height: "36px",
                    objectFit: "contain",
                  }}
                />
              </div>
              {!sidebarCollapsed && (
                <div className="text-white font-bold text-sm truncate min-w-0">
                  {t("app.name")}
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto no-scrollbar p-3">
              <div
                className="flex flex-col gap-1"
                style={
                  sidebarCollapsed
                    ? { alignItems: "center" }
                    : { alignItems: "stretch" }
                }
              >
                {menuItems.map((item) => renderMenuItem(item, sidebarCollapsed))}
              </div>
            </nav>

            {/* Footer Spacer */}
            <div
              className="border-t border-white/15 bg-white/5 flex-shrink-0"
              style={{ height: "48px" }}
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 h-full flex flex-col pr-8 py-8">
          {/* Top Bar */}
          <div className="flex-shrink-0 mb-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white flex-shrink-0"
                    style={{ width: "40px", height: "40px" }}
                    title={
                      sidebarCollapsed
                        ? t("layout.sidebar.expand")
                        : t("layout.sidebar.collapse")
                    }
                  >
                    {sidebarCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
                  </button>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2 min-w-0 truncate">
                    {currentPage && (
                      <span style={{ flexShrink: 0 }}>
                        {React.createElement(currentPage.icon, { size: 24 })}
                      </span>
                    )}
                    <span className="truncate">
                      {currentPage ? t(currentPage.labelKey) : t("app.name")}
                    </span>
                  </h1>
                </div>
                <button
                  onClick={toggleLanguage}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm font-medium flex-shrink-0 ml-4"
                  title={
                    language === "zh"
                      ? t("layout.languageSwitch.toEnglishFull")
                      : t("layout.languageSwitch.toChineseFull")
                  }
                >
                  {language === "zh"
                    ? t("layout.languageSwitch.toEnglishShort")
                    : t("layout.languageSwitch.toChineseShort")}
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto px-4 pb-10">{children}</div>
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full w-full">
        {/* Mobile Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-40 p-4 flex-shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-white truncate flex-1 min-w-0 mr-2">
              {t("app.name")}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={toggleLanguage}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm"
                title={
                  language === "zh"
                    ? t("layout.languageSwitch.toEnglishFull")
                    : t("layout.languageSwitch.toChineseFull")
                }
              >
                {language === "zh"
                  ? t("layout.languageSwitch.toEnglishShort")
                  : t("layout.languageSwitch.toChineseShort")}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                title={
                  mobileMenuOpen
                    ? t("layout.mobileMenu.close")
                    : t("layout.mobileMenu.open")
                }
              >
                {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="fixed top-20 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-4 max-h-[70vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="flex flex-col gap-1">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold"
                          : "text-white/80 hover:bg-white/20"
                      }`}
                      style={{ height: "48px" }}
                      title={t(item.labelKey)}
                      aria-current={active ? "page" : undefined}
                    >
                      <div style={{ width: "20px", height: "20px", flexShrink: 0 }}>
                        <IconComponent size={20} />
                      </div>
                      <span className="text-sm">{t(item.labelKey)}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <div className="flex-1 pt-20 px-4 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
