import React, { useCallback, useEffect, useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { useLanguage } from "../contexts/LanguageContext";

const HASH_ALGORITHMS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
const ENCODING_TYPES = ["base64", "url", "hex"] as const;
const HASH_ERROR = "__error__";
const HASH_UNSUPPORTED = "__unsupported__";

type EncodingKey = (typeof ENCODING_TYPES)[number];

type SupportedTranslations = {
  items?: { label: string; value: string }[];
  note?: string;
};

const HashToolPage: React.FC = () => {
  const { t, getSection } = useLanguage();
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [encodings, setEncodings] = useState<Record<EncodingKey, string>>({
    base64: "",
    url: "",
    hex: "",
  });
  const [copied, setCopied] = useState<string | null>(null);

  const supportedSection = getSection<SupportedTranslations>(
    "pages.hashTool.supported",
  );
  const supportedItems = Array.isArray(supportedSection.items)
    ? supportedSection.items
    : [];
  const supportedNote = supportedSection.note ?? "";

  const calculateHashes = useCallback(async (text: string) => {
    if (typeof window === "undefined" || !window.crypto?.subtle) {
      const fallback: Record<string, string> = {};
      HASH_ALGORITHMS.forEach((algo) => {
        fallback[algo] = HASH_ERROR;
      });
      fallback["MD5"] = HASH_UNSUPPORTED;
      setHashes(fallback);
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const results: Record<string, string> = {};

    await Promise.all(
      HASH_ALGORITHMS.map(async (algo) => {
        try {
          const hashBuffer = await window.crypto.subtle.digest(algo, data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          results[algo] = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        } catch {
          results[algo] = HASH_ERROR;
        }
      }),
    );

    results["MD5"] = HASH_UNSUPPORTED;
    setHashes(results);
  }, []);

  const calculateEncodings = useCallback((text: string) => {
    const results: Record<EncodingKey, string> = {
      base64: "",
      url: "",
      hex: "",
    };

    try {
      results.base64 = btoa(unescape(encodeURIComponent(text)));
    } catch {
      results.base64 = HASH_ERROR;
    }

    try {
      results.url = encodeURIComponent(text);
    } catch {
      results.url = HASH_ERROR;
    }

    try {
      results.hex = Array.from(new TextEncoder().encode(text))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");
    } catch {
      results.hex = HASH_ERROR;
    }

    setEncodings(results);
  }, []);

  useEffect(() => {
    if (input) {
      void calculateHashes(input);
      calculateEncodings(input);
    } else {
      setHashes({});
      setEncodings({ base64: "", url: "", hex: "" });
    }
    setCopied(null);
  }, [input, calculateHashes, calculateEncodings]);

  const copyToClipboard = (value: string, key: string) => {
    if (!value || value === HASH_ERROR || value === HASH_UNSUPPORTED) {
      return;
    }
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDecode = (type: EncodingKey) => {
    try {
      if (type === "base64") {
        setInput(decodeURIComponent(escape(atob(input))));
      } else if (type === "url") {
        setInput(decodeURIComponent(input));
      }
    } catch (error) {
      console.error("Decode error:", error);
      alert(t("pages.hashTool.messages.decodeError"));
    }
  };

  const formatValue = (value: string) => {
    if (value === HASH_UNSUPPORTED) {
      return t("pages.hashTool.messages.md5Unsupported");
    }
    if (value === HASH_ERROR) {
      return t("pages.hashTool.messages.error");
    }
    return value;
  };

  const hasResults = Boolean(input.trim());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          {t("pages.hashTool.title")}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t("pages.hashTool.input.label")}
            </label>
            <textarea
              rows={5}
              className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70 resize-none"
              placeholder={t("pages.hashTool.input.placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleDecode("base64")}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition text-sm"
            >
              {t("pages.hashTool.actions.decode.base64")}
            </button>
            <button
              onClick={() => handleDecode("url")}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition text-sm"
            >
              {t("pages.hashTool.actions.decode.url")}
            </button>
          </div>
        </div>
      </div>

      {hasResults && (
        <>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-slide-in-up">
            <h3 className="text-xl font-bold text-white mb-4">
              {t("pages.hashTool.sections.hashes")}
            </h3>
            <div className="space-y-3">
              {[...HASH_ALGORITHMS, "MD5"].map((algo) => {
                const value =
                  hashes[algo] ??
                  (algo === "MD5" ? HASH_UNSUPPORTED : HASH_ERROR);
                const displayValue = formatValue(value);
                return (
                  <ResultItem
                    key={algo}
                    label={algo}
                    value={displayValue}
                    mono
                    copied={copied === algo}
                    onCopy={() => copyToClipboard(value, algo)}
                    copyDisabled={
                      value === HASH_ERROR || value === HASH_UNSUPPORTED
                    }
                  />
                );
              })}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-slide-in-up">
            <h3 className="text-xl font-bold text-white mb-4">
              {t("pages.hashTool.sections.encodings")}
            </h3>
            <div className="space-y-3">
              {ENCODING_TYPES.map((key) => {
                const value = encodings[key];
                const displayValue = formatValue(value);
                return (
                  <ResultItem
                    key={key}
                    label={t(`pages.hashTool.encodings.types.${key}`)}
                    value={displayValue}
                    mono
                    copied={copied === key}
                    onCopy={() => copyToClipboard(value, key)}
                    copyDisabled={value === HASH_ERROR || !value}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          {t("pages.hashTool.sections.supported")}
        </h3>
        <ul className="text-white/80 text-sm space-y-2 list-disc list-inside">
          {supportedItems.map((item, index) => (
            <li key={`${item.label}-${index}`}>
              <strong>{item.label}</strong>: {item.value}
            </li>
          ))}
        </ul>
        {supportedNote && (
          <p className="text-xs text-white/60 mt-3">{supportedNote}</p>
        )}
      </div>
    </div>
  );
};

interface ResultItemProps {
  label: string;
  value: string;
  mono?: boolean;
  copied: boolean;
  onCopy: () => void;
  copyDisabled?: boolean;
}

const ResultItem: React.FC<ResultItemProps> = ({
  label,
  value,
  mono,
  copied,
  onCopy,
  copyDisabled,
}) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/70 text-sm font-medium">{label}</span>
        <button
          onClick={onCopy}
          disabled={copyDisabled}
          className={`p-2 rounded-lg transition text-white ${
            copyDisabled
              ? "bg-white/5 opacity-60 cursor-not-allowed"
              : "bg-white/10 hover:bg-white/20"
          }`}
          title={t("common.copy")}
        >
          {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
        </button>
      </div>
      <p
        className={`text-white ${mono ? "font-mono text-xs" : "text-sm"} break-all`}
      >
        {value}
      </p>
    </div>
  );
};

export default HashToolPage;
