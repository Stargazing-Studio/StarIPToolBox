import React, { useState } from "react";
import { FiCopy, FiDownload, FiCheck } from "react-icons/fi";
import { useLanguage } from "../contexts/LanguageContext";

type GeneratorMode = "cidr" | "range" | "random";

const IPGeneratorPage: React.FC = () => {
  const { t, getSection } = useLanguage();
  const [mode, setMode] = useState<GeneratorMode>("cidr");
  const [cidr, setCidr] = useState("");
  const [startIP, setStartIP] = useState("");
  const [endIP, setEndIP] = useState("");
  const [randomCount, setRandomCount] = useState("100");
  const [ips, setIps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usageTipsSection = getSection<{ title?: string; items?: string[] }>(
    "pages.ipGenerator.usageTips",
  );
  const usageTips = Array.isArray(usageTipsSection.items)
    ? usageTipsSection.items
    : [];

  const parseCIDR = (cidr: string): string[] => {
    const [baseIP, bits] = cidr.split("/");
    const bitsNum = parseInt(bits);
    if (bitsNum < 0 || bitsNum > 32) throw new Error("Invalid CIDR");

    const parts = baseIP.split(".").map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      throw new Error("Invalid IP address");
    }

    const ipInt =
      (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
    const mask = ~((1 << (32 - bitsNum)) - 1);
    const network = ipInt & mask;
    const hostCount = 1 << (32 - bitsNum);

    const result: string[] = [];
    const limit = Math.min(hostCount, 10000);
    for (let i = 0; i < limit; i++) {
      const ip = network + i;
      result.push(
        [(ip >>> 24) & 255, (ip >>> 16) & 255, (ip >>> 8) & 255, ip & 255].join(
          ".",
        ),
      );
    }

    if (hostCount > 10000) {
      setError(
        `Limited to first 10,000 IPs (total: ${hostCount.toLocaleString()})`,
      );
    }

    return result;
  };

  const parseRange = (start: string, end: string): string[] => {
    const startParts = start.split(".").map(Number);
    const endParts = end.split(".").map(Number);

    if (startParts.some((p) => isNaN(p)) || endParts.some((p) => isNaN(p))) {
      throw new Error("Invalid IP address");
    }

    const startInt =
      (startParts[0] << 24) |
      (startParts[1] << 16) |
      (startParts[2] << 8) |
      startParts[3];
    const endInt =
      (endParts[0] << 24) |
      (endParts[1] << 16) |
      (endParts[2] << 8) |
      endParts[3];

    if (startInt > endInt) throw new Error("Start IP must be less than end IP");

    const result: string[] = [];
    const limit = Math.min(endInt - startInt + 1, 10000);

    for (let i = 0; i < limit; i++) {
      const ip = startInt + i;
      result.push(
        [(ip >>> 24) & 255, (ip >>> 16) & 255, (ip >>> 8) & 255, ip & 255].join(
          ".",
        ),
      );
    }

    if (endInt - startInt + 1 > 10000) {
      setError(
        `Limited to first 10,000 IPs (total: ${(endInt - startInt + 1).toLocaleString()})`,
      );
    }

    return result;
  };

  const generateRandom = (count: number): string[] => {
    const result: string[] = [];
    const used = new Set<string>();
    const limit = Math.min(count, 1000);

    while (result.length < limit) {
      const ip = [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
      ].join(".");

      if (!used.has(ip)) {
        used.add(ip);
        result.push(ip);
      }
    }

    if (count > 1000) {
      setError(`Limited to 1,000 random IPs (requested: ${count})`);
    }

    return result;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      let result: string[] = [];

      if (mode === "cidr") {
        if (!cidr.trim()) throw new Error("Please enter CIDR");
        result = parseCIDR(cidr.trim());
      } else if (mode === "range") {
        if (!startIP.trim() || !endIP.trim())
          throw new Error("Please enter both IPs");
        result = parseRange(startIP.trim(), endIP.trim());
      } else if (mode === "random") {
        const count = parseInt(randomCount);
        if (isNaN(count) || count < 1) throw new Error("Invalid count");
        result = generateRandom(count);
      }

      setIps(result);
    } catch (err: any) {
      setError(err.message);
      setIps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ips.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([ips.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ip-list-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csv = "IP Address\n" + ips.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ip-list-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          {t("bulkIPGenerator")}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t("generationMode")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "cidr" as GeneratorMode, label: t("cidrMode") },
                { value: "range" as GeneratorMode, label: t("rangeMode") },
                { value: "random" as GeneratorMode, label: t("randomMode") },
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`py-2 px-4 rounded-lg transition text-sm ${
                    mode === m.value
                      ? "bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {mode === "cidr" && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {t("cidrNotation")}
              </label>
              <input
                type="text"
                className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
                placeholder="10.0.0.0/24"
                value={cidr}
                onChange={(e) => setCidr(e.target.value)}
              />
            </div>
          )}

          {mode === "range" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t("startIP")}
                </label>
                <input
                  type="text"
                  className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
                  placeholder="192.168.1.1"
                  value={startIP}
                  onChange={(e) => setStartIP(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t("endIP")}
                </label>
                <input
                  type="text"
                  className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
                  placeholder="192.168.1.254"
                  value={endIP}
                  onChange={(e) => setEndIP(e.target.value)}
                />
              </div>
            </div>
          )}

          {mode === "random" && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {t("numberOfIPs")}
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
                placeholder="100"
                value={randomCount}
                onChange={(e) => setRandomCount(e.target.value)}
              />
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {loading ? t("generating") : t("generateIPs")}
          </button>

          {error && (
            <p className="text-yellow-400 text-center text-sm">{error}</p>
          )}
        </div>
      </div>

      {ips.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-slide-in-up">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              {t("generated")}: {ips.length.toLocaleString()} IPs
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition text-sm"
              >
                {copied ? <FiCheck /> : <FiCopy />}
                {copied ? t("copied") : t("copy")}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition text-sm"
              >
                <FiDownload />
                TXT
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition text-sm"
              >
                <FiDownload />
                CSV
              </button>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 max-h-96 overflow-y-auto custom-scrollbar">
            <pre className="text-white text-xs font-mono">{ips.join("\n")}</pre>
          </div>
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          {usageTipsSection.title ?? t("pages.ipGenerator.usageTips.title")}
        </h3>
        <ul className="text-white/80 text-sm space-y-2 list-disc list-inside">
          {usageTips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default IPGeneratorPage;
