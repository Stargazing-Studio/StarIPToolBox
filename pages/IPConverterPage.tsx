import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

type FormatType = "dotted" | "decimal" | "hex" | "binary";

const IPConverterPage: React.FC = () => {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [decimal, setDecimal] = useState("");
  const [dotted, setDotted] = useState("");
  const [hex, setHex] = useState("");
  const [binary, setBinary] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetResults = () => {
    setDecimal("");
    setDotted("");
    setHex("");
    setBinary("");
  };

  const updateResults = (ipInt: number) => {
    const parts = [
      (ipInt >>> 24) & 255,
      (ipInt >>> 16) & 255,
      (ipInt >>> 8) & 255,
      ipInt & 255,
    ];

    setDotted(parts.join("."));
    setDecimal(ipInt.toString());
    setHex("0x" + ipInt.toString(16).toUpperCase().padStart(8, "0"));
    setBinary(parts.map((p) => p.toString(2).padStart(8, "0")).join(" "));
  };

  const convert = (value: string, type: FormatType) => {
    const raw = value.trim();
    if (!raw) {
      setError(t("pages.ipConverter.errors.generic"));
      resetResults();
      return;
    }

    try {
      let ipInt: number;

      if (type === "dotted") {
        const parts = raw.split(".").map((part) => Number(part));
        if (
          parts.length !== 4 ||
          parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)
        ) {
          setError(t("pages.ipConverter.errors.dotted"));
          resetResults();
          return;
        }
        ipInt =
          (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
      } else if (type === "decimal") {
        ipInt = Number(raw);
        if (!Number.isInteger(ipInt) || ipInt < 0 || ipInt > 4294967295) {
          setError(t("pages.ipConverter.errors.decimal"));
          resetResults();
          return;
        }
      } else if (type === "hex") {
        const hexValue = raw.replace(/^0x/i, "");
        ipInt = Number.parseInt(hexValue, 16);
        if (Number.isNaN(ipInt)) {
          setError(t("pages.ipConverter.errors.hex"));
          resetResults();
          return;
        }
      } else {
        const binaryValue = raw.replace(/\s+/g, "");
        if (!/^[01]+$/.test(binaryValue)) {
          setError(t("pages.ipConverter.errors.binary"));
          resetResults();
          return;
        }
        ipInt = Number.parseInt(binaryValue, 2);
      }

      setError(null);
      updateResults(ipInt);
    } catch (err) {
      console.error("Conversion error:", err);
      setError(t("pages.ipConverter.errors.generic"));
      resetResults();
    }
  };

  const handleConvert = (format: FormatType) => {
    convert(input, format);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          {t("pages.ipConverter.title")}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t("pages.ipConverter.inputLabel")}
            </label>
            <input
              type="text"
              className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
              placeholder={t("pages.ipConverter.placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleConvert("dotted")}
              className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition text-sm"
            >
              {t("pages.ipConverter.formats.dotted")}
            </button>
            <button
              onClick={() => handleConvert("decimal")}
              className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition text-sm"
            >
              {t("pages.ipConverter.formats.decimal")}
            </button>
            <button
              onClick={() => handleConvert("hex")}
              className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition text-sm"
            >
              {t("pages.ipConverter.formats.hex")}
            </button>
            <button
              onClick={() => handleConvert("binary")}
              className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition text-sm"
            >
              {t("pages.ipConverter.formats.binary")}
            </button>
          </div>

          {error && <p className="text-red-400 text-center text-sm">{error}</p>}
        </div>
      </div>

      {dotted && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-slide-in-up">
          <h3 className="text-xl font-bold text-white mb-4">
            {t("pages.ipConverter.resultTitle")}
          </h3>

          <div className="space-y-3">
            <ConversionResult
              label={t("pages.ipConverter.formats.dotted")}
              value={dotted}
            />
            <ConversionResult
              label={t("pages.ipConverter.formats.decimal")}
              value={decimal}
            />
            <ConversionResult
              label={t("pages.ipConverter.formats.hex")}
              value={hex}
            />
            <ConversionResult
              label={t("pages.ipConverter.formats.binary")}
              value={binary}
              mono
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface ConversionResultProps {
  label: string;
  value: string;
  mono?: boolean;
}

const ConversionResult: React.FC<ConversionResultProps> = ({
  label,
  value,
  mono,
}) => (
  <div className="bg-white/5 rounded-lg p-4">
    <p className="text-white/70 text-xs mb-1">{label}</p>
    <p
      className={`text-white ${mono ? "font-mono text-sm" : "text-lg"} break-all`}
    >
      {value}
    </p>
  </div>
);

export default IPConverterPage;
