import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { FiCopy, FiCheck } from "react-icons/fi";

interface ParsedURL {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  username: string;
  password: string;
  origin: string;
  host: string;
  searchParams: Record<string, string>;
}

const URLParserPage: React.FC = () => {
  const { t } = useLanguage();
  const [inputURL, setInputURL] = useState("");
  const [parsed, setParsed] = useState<ParsedURL | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const parseURL = (urlString: string) => {
    const trimmed = urlString.trim();
    if (!trimmed) {
      setError(t("pages.urlParser.errors.empty"));
      setParsed(null);
      return;
    }

    try {
      const url = new URL(trimmed);
      const searchParams: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        searchParams[key] = value;
      });

      setParsed({
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || t("pages.urlParser.results.defaultPort"),
        pathname: url.pathname || "/",
        search: url.search,
        hash: url.hash,
        username: url.username,
        password: url.password,
        origin: url.origin,
        host: url.host,
        searchParams,
      });
      setError(null);
    } catch (err) {
      setError(t("pages.urlParser.errors.invalid"));
      setParsed(null);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const renderField = (label: string, value: string, fieldKey: string) => {
    if (!value) return null;

    return (
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60 font-medium">{label}</span>
          <button
            onClick={() => copyToClipboard(value, fieldKey)}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
            title={t("common.copy")}
          >
            {copiedField === fieldKey ? (
              <FiCheck size={16} />
            ) : (
              <FiCopy size={16} />
            )}
          </button>
        </div>
        <div className="text-white font-mono break-all text-sm">{value}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          {t("pages.urlParser.title")}
        </h2>
        <p className="text-white/80 text-sm mb-6">
          {t("pages.urlParser.description")}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">
              {t("pages.urlParser.input.label")}
            </label>
            <input
              type="text"
              value={inputURL}
              onChange={(e) => setInputURL(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && parseURL(inputURL)}
              placeholder={t("pages.urlParser.input.placeholder")}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
            />
          </div>

          <button
            onClick={() => parseURL(inputURL)}
            className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {t("pages.urlParser.actions.parse")}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {parsed && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {t("pages.urlParser.results.title")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField(
              t("pages.urlParser.results.protocol"),
              parsed.protocol,
              "protocol"
            )}
            {renderField(
              t("pages.urlParser.results.hostname"),
              parsed.hostname,
              "hostname"
            )}
            {renderField(
              t("pages.urlParser.results.port"),
              parsed.port,
              "port"
            )}
            {renderField(
              t("pages.urlParser.results.pathname"),
              parsed.pathname,
              "pathname"
            )}
            {renderField(
              t("pages.urlParser.results.origin"),
              parsed.origin,
              "origin"
            )}
            {renderField(
              t("pages.urlParser.results.host"),
              parsed.host,
              "host"
            )}
            {parsed.username &&
              renderField(
                t("pages.urlParser.results.username"),
                parsed.username,
                "username"
              )}
            {parsed.password &&
              renderField(
                t("pages.urlParser.results.password"),
                "••••••••",
                "password"
              )}
            {parsed.search &&
              renderField(
                t("pages.urlParser.results.search"),
                parsed.search,
                "search"
              )}
            {parsed.hash &&
              renderField(
                t("pages.urlParser.results.hash"),
                parsed.hash,
                "hash"
              )}
          </div>

          {Object.keys(parsed.searchParams).length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-3">
                {t("pages.urlParser.results.queryParams")}
              </h4>
              <div className="space-y-2">
                {Object.entries(parsed.searchParams).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="text-sky-400 font-mono text-sm">
                          {key}
                        </span>
                        <span className="text-white/40 mx-2">=</span>
                        <span className="text-white font-mono text-sm break-all">
                          {value}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(`${key}=${value}`, `param-${key}`)
                        }
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors ml-2 flex-shrink-0"
                        title={t("common.copy")}
                      >
                        {copiedField === `param-${key}` ? (
                          <FiCheck size={14} />
                        ) : (
                          <FiCopy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default URLParserPage;
