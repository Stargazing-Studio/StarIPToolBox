import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const SEPARATOR_OPTIONS = [":", "-", ""] as const;

type SeparatorOption = (typeof SEPARATOR_OPTIONS)[number];

const MACGeneratorPage: React.FC = () => {
  const { t } = useLanguage();
  const [count, setCount] = useState(1);
  const [separator, setSeparator] = useState<SeparatorOption>(":");
  const [upperCase, setUpperCase] = useState(true);
  const [macAddresses, setMacAddresses] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generateMAC = (): string => {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);

    bytes[0] = (bytes[0] & 0xfe) | 0x02;

    const raw = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(separator);

    return upperCase ? raw.toUpperCase() : raw;
  };

  const handleGenerate = () => {
    const macs = Array.from({ length: count }, () => generateMAC());
    setMacAddresses(macs);
    setCopied(false);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(macAddresses.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const separatorLabel = (value: SeparatorOption) =>
    value || t("pages.macGenerator.form.separatorOptions.none");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          {t("pages.macGenerator.title")}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t("pages.macGenerator.form.countLabel")}
            </label>
            <input
              type="number"
              min="1"
              max="100"
              className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white"
              value={count}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (Number.isNaN(value)) {
                  setCount(1);
                  return;
                }
                setCount(Math.min(100, Math.max(1, value)));
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t("pages.macGenerator.form.separatorLabel")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SEPARATOR_OPTIONS.map((option) => (
                <button
                  key={option || "none"}
                  onClick={() => setSeparator(option)}
                  className={`py-2 px-4 rounded-lg transition text-sm ${
                    separator === option
                      ? "bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {separatorLabel(option)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={upperCase}
                onChange={(e) => setUpperCase(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">
                {t("pages.macGenerator.form.uppercaseLabel")}
              </span>
            </label>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
          >
            {t("pages.macGenerator.form.generate")}
          </button>
        </div>
      </div>

      {macAddresses.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-slide-in-up">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              {t("pages.macGenerator.results.title")}
            </h3>
            <button
              onClick={handleCopyAll}
              className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition text-sm"
            >
              {copied ? t("common.copied") : t("common.copyAll")}
            </button>
          </div>

          <div className="bg-white/5 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {macAddresses.map((mac, index) => (
                <div
                  key={`${mac}-${index}`}
                  className="font-mono text-white text-sm py-2 px-3 bg-white/5 rounded hover:bg-white/10 transition"
                >
                  {mac}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <p className="text-blue-200 text-xs">
              {t("pages.macGenerator.results.hint")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MACGeneratorPage;
