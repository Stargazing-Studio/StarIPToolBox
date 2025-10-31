import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { FiCopy, FiCheck, FiArrowRight } from "react-icons/fi";

const PunycodeConverterPage: React.FC = () => {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [encoded, setEncoded] = useState("");
  const [decoded, setDecoded] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const punycodeDecode = (input: string): string => {
    try {
      const url = new URL(`http://${input}`);
      return url.hostname;
    } catch {
      return input;
    }
  };

  const punycodeEncode = (input: string): string => {
    try {
      const url = new URL(`http://${input}`);
      const href = url.href;
      const match = href.match(/^https?:\/\/([^\/]+)/);
      return match ? match[1] : input;
    } catch {
      return input;
    }
  };

  const handleConvert = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError(t("pages.punycodeConverter.errors.empty"));
      setEncoded("");
      setDecoded("");
      return;
    }

    try {
      setError(null);
      
      const encodedResult = punycodeEncode(trimmed);
      setEncoded(encodedResult);

      const decodedResult = punycodeDecode(trimmed);
      setDecoded(decodedResult);
    } catch (err) {
      setError(t("pages.punycodeConverter.errors.conversion"));
      setEncoded("");
      setDecoded("");
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const examples = [
    { idn: "中国.com", punycode: "xn--fiqs8s.com" },
    { idn: "日本.jp", punycode: "xn--wgv71a.jp" },
    { idn: "münchen.de", punycode: "xn--mnchen-3ya.de" },
    { idn: "москва.рф", punycode: "xn--80adxhks.xn--p1ai" },
  ];

  const loadExample = (example: string) => {
    setInput(example);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          {t("pages.punycodeConverter.title")}
        </h2>
        <p className="text-white/80 text-sm mb-6">
          {t("pages.punycodeConverter.description")}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">
              {t("pages.punycodeConverter.input.label")}
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleConvert()}
              placeholder={t("pages.punycodeConverter.input.placeholder")}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
            />
          </div>

          <button
            onClick={handleConvert}
            className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {t("pages.punycodeConverter.actions.convert")}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {(encoded || decoded) && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {t("pages.punycodeConverter.results.title")}
          </h3>

          <div className="space-y-4">
            {encoded && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60 font-medium">
                    {t("pages.punycodeConverter.results.punycode")}
                  </span>
                  <button
                    onClick={() => copyToClipboard(encoded, "encoded")}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
                    title={t("common.copy")}
                  >
                    {copiedField === "encoded" ? (
                      <FiCheck size={16} />
                    ) : (
                      <FiCopy size={16} />
                    )}
                  </button>
                </div>
                <div className="text-white font-mono break-all">{encoded}</div>
              </div>
            )}

            {decoded && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60 font-medium">
                    {t("pages.punycodeConverter.results.unicode")}
                  </span>
                  <button
                    onClick={() => copyToClipboard(decoded, "decoded")}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
                    title={t("common.copy")}
                  >
                    {copiedField === "decoded" ? (
                      <FiCheck size={16} />
                    ) : (
                      <FiCopy size={16} />
                    )}
                  </button>
                </div>
                <div className="text-white font-mono break-all text-lg">
                  {decoded}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          {t("pages.punycodeConverter.examples.title")}
        </h3>
        <div className="space-y-2">
          {examples.map((example, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => loadExample(example.idn)}
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-white font-mono">{example.idn}</span>
                  <FiArrowRight className="text-white/40 flex-shrink-0" />
                  <span className="text-sky-400 font-mono truncate">
                    {example.punycode}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadExample(example.idn);
                  }}
                  className="ml-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition-colors flex-shrink-0"
                >
                  {t("pages.punycodeConverter.examples.try")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PunycodeConverterPage;
