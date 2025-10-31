import React, { useState, useEffect, lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Layout from "./components/Layout";
import { Spinner } from "./components/Spinner";
import type { ProxyResult } from "./types";

const HomePage = lazy(() => import("./pages/HomePage"));
const MyIPPage = lazy(() => import("./pages/MyIPPage"));
const IPLookupPage = lazy(() => import("./pages/IPLookupPage"));
const BrowserTestPage = lazy(() => import("./pages/BrowserTestPage"));
const SubnetCalcPage = lazy(() => import("./pages/SubnetCalcPage"));
const IPConverterPage = lazy(() => import("./pages/IPConverterPage"));
const MACGeneratorPage = lazy(() => import("./pages/MACGeneratorPage"));
const HashToolPage = lazy(() => import("./pages/HashToolPage"));
const DNSVisualizerPage = lazy(() => import("./pages/DNSVisualizerPage"));
const WebSocketTestPage = lazy(() => import("./pages/WebSocketTestPage"));
const IPGeneratorPage = lazy(() => import("./pages/IPGeneratorPage"));
const BlockRulesPage = lazy(() => import("./pages/BlockRulesPage"));
const IPv6ToolsPage = lazy(() => import("./pages/IPv6ToolsPage"));
const HTTPCheckerPage = lazy(() => import("./pages/HTTPCheckerPage"));
const URLParserPage = lazy(() => import("./pages/URLParserPage"));
const PunycodeConverterPage = lazy(() => import("./pages/PunycodeConverterPage"));
const EmailHeaderAnalyzerPage = lazy(() => import("./pages/EmailHeaderAnalyzerPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

function App() {
  const [backgroundUrl, setBackgroundUrl] = useState<string>("");
  const [loadingBackground, setLoadingBackground] = useState<boolean>(true);
  const [results, setResults] = useState<ProxyResult[]>([]);
  const [proxyInput, setProxyInput] = useState("");
  const [urlInput, setUrlInput] = useState("");

  useEffect(() => {
    const fetchAndPreloadImage = async () => {
      setLoadingBackground(true);
      
      const wallpaperApiUrl = import.meta.env.VITE_WALLPAPER_API_URL;
      
      // If no API URL is configured, use default gradient background
      if (!wallpaperApiUrl || wallpaperApiUrl.trim() === "") {
        console.info(
          "No wallpaper API configured. Using default gradient background.\n" +
          "To use a custom wallpaper, set VITE_WALLPAPER_API_URL in your .env file.\n" +
          "Recommended: https://github.com/SunXin121/bing_wallpaper"
        );
        setBackgroundUrl("");
        setLoadingBackground(false);
        return;
      }

      try {
        // Preload the image to prevent flash of content before image loads
        const img = new Image();
        img.src = wallpaperApiUrl;
        img.onload = () => {
          setBackgroundUrl(wallpaperApiUrl);
          setLoadingBackground(false);
        };
        img.onerror = () => {
          // Fallback on error
          console.warn(
            "Failed to load wallpaper from API. Using default gradient background.\n" +
            "Please check your VITE_WALLPAPER_API_URL configuration."
          );
          setBackgroundUrl("");
          setLoadingBackground(false);
        };
      } catch (error) {
        console.error("Failed to fetch wallpaper background:", error);
        setBackgroundUrl("");
        setLoadingBackground(false);
      }
    };

    fetchAndPreloadImage();
  }, []);

  const backgroundStyle = backgroundUrl
    ? { backgroundImage: `url(${backgroundUrl})` }
    : {};

  const backgroundClasses = backgroundUrl
    ? "min-h-screen w-full bg-cover bg-center bg-fixed bg-no-repeat transition-all duration-1000 ease-in-out overflow-hidden"
    : "min-h-screen w-full bg-gradient-to-br from-sky-200 via-blue-100 to-purple-100 transition-all duration-1000 ease-in-out overflow-hidden";

  return (
    <LanguageProvider>
      <HashRouter>
        <div
          className={backgroundClasses}
          style={backgroundStyle}
        >
          <div className="h-screen w-full overflow-hidden">
            {loadingBackground ? (
              <div className="flex h-screen items-center justify-center bg-gradient-to-br from-sky-200 to-white">
                <Spinner size="lg" />
              </div>
            ) : (
              <Layout>
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center min-h-[400px]">
                      <Spinner size="lg" />
                    </div>
                  }
                >
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <HomePage
                          results={results}
                          setResults={setResults}
                          proxyInput={proxyInput}
                          setProxyInput={setProxyInput}
                          urlInput={urlInput}
                          setUrlInput={setUrlInput}
                        />
                      }
                    />
                    <Route path="/my-ip" element={<MyIPPage />} />
                    <Route path="/ip-lookup" element={<IPLookupPage />} />
                    <Route path="/browser-test" element={<BrowserTestPage />} />
                    <Route path="/subnet-calc" element={<SubnetCalcPage />} />
                    <Route path="/ip-converter" element={<IPConverterPage />} />
                    <Route
                      path="/mac-generator"
                      element={<MACGeneratorPage />}
                    />
                    <Route path="/hash-tool" element={<HashToolPage />} />
                    <Route
                      path="/dns-visualizer"
                      element={<DNSVisualizerPage />}
                    />
                    <Route
                      path="/websocket-test"
                      element={<WebSocketTestPage />}
                    />
                    <Route path="/ip-generator" element={<IPGeneratorPage />} />
                    <Route path="/block-rules" element={<BlockRulesPage />} />
                    <Route path="/ipv6-tools" element={<IPv6ToolsPage />} />
                    <Route path="/http-checker" element={<HTTPCheckerPage />} />
                    <Route path="/url-parser" element={<URLParserPage />} />
                    <Route path="/punycode-converter" element={<PunycodeConverterPage />} />
                    <Route path="/email-header-analyzer" element={<EmailHeaderAnalyzerPage />} />
                    <Route path="/about" element={<AboutPage />} />
                  </Routes>
                </Suspense>
              </Layout>
            )}
          </div>
        </div>
      </HashRouter>
    </LanguageProvider>
  );
}

export default App;
