import React, { useState } from "react";
import { Spinner } from "../components/Spinner";
import { useLanguage } from "../contexts/LanguageContext";

interface IPInfo {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  timezone?: string;
  postal?: string;
  hostname?: string;
}

const IPLookupPage: React.FC = () => {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidIP = (str: string): boolean => {
    const ipv4Regex =
      /^((25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(25[0-5]|2[0-4]\d|[01]?\d?\d)$/;
    return ipv4Regex.test(str);
  };

  const handleLookup = async () => {
    if (!input.trim()) {
      setError(t("pages.ipLookup.errors.emptyInput"));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIpInfo(null);

      let targetIP = input.trim();
      if (!isValidIP(targetIP)) {
        const dohResponse = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(targetIP)}&type=A`,
          { headers: { Accept: "application/dns-json" } },
        );
        if (!dohResponse.ok) {
          throw new Error("dnsQueryFailed");
        }
        const dohData = await dohResponse.json();
        if (dohData.Answer && dohData.Answer.length > 0) {
          targetIP = dohData.Answer[0].data;
        } else {
          throw new Error("domainResolveFailed");
        }
      }

      const response = await fetch(`https://ipinfo.io/${targetIP}/json?token=`);
      if (!response.ok) {
        throw new Error("lookupFailed");
      }
      const data = await response.json();
      setIpInfo(data);
    } catch (err) {
      console.error("Lookup error:", err);
      const messageKeyMap: Record<string, string> = {
        dnsQueryFailed: "pages.ipLookup.errors.dnsQueryFailed",
        domainResolveFailed: "pages.ipLookup.errors.domainResolveFailed",
        lookupFailed: "pages.ipLookup.errors.lookupFailed",
      };
      const fallbackKey = "pages.ipLookup.errors.lookupFailed";
      const messageKey =
        err instanceof Error && err.message in messageKeyMap
          ? messageKeyMap[err.message]
          : fallbackKey;
      setError(t(messageKey));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          {t("pages.ipLookup.title")}
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="lookup-input"
              className="block text-sm font-medium text-white mb-2"
            >
              {t("pages.ipLookup.inputLabel")}
            </label>
            <input
              id="lookup-input"
              type="text"
              className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
              placeholder={t("pages.ipLookup.placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              disabled={loading}
            />
          </div>

          <button
            onClick={handleLookup}
            disabled={loading || !input.trim()}
            className="w-full bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {loading
              ? t("pages.ipLookup.button.loading")
              : t("pages.ipLookup.button.idle")}
          </button>

          {error && <p className="text-red-400 text-center text-sm">{error}</p>}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center">
          <Spinner size="md" />
        </div>
      )}

      {ipInfo && !loading && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-slide-in-up">
          <h3 className="text-xl font-bold text-white mb-4">
            {t("pages.ipLookup.resultsTitle")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              label={t("pages.ipLookup.fields.ip")}
              value={ipInfo.ip}
              highlight
            />
            <InfoItem
              label={t("pages.ipLookup.fields.hostname")}
              value={ipInfo.hostname}
            />
            <InfoItem
              label={t("pages.ipLookup.fields.country")}
              value={ipInfo.country}
            />
            <InfoItem
              label={t("pages.ipLookup.fields.region")}
              value={ipInfo.region}
            />
            <InfoItem
              label={t("pages.ipLookup.fields.city")}
              value={ipInfo.city}
            />
            <InfoItem
              label={t("pages.ipLookup.fields.isp")}
              value={ipInfo.org}
            />
            <InfoItem
              label={t("pages.ipLookup.fields.timezone")}
              value={ipInfo.timezone}
            />
            <InfoItem
              label={t("pages.ipLookup.fields.coordinates")}
              value={ipInfo.loc}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem: React.FC<{
  label: string;
  value?: string;
  highlight?: boolean;
}> = ({ label, value, highlight }) => {
  const { t } = useLanguage();
  return (
    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
      <span className="text-white/70 text-sm">{label}:</span>
      <span
        className={`font-mono ${highlight ? "text-sky-400 font-bold" : "text-white"}`}
      >
        {value || t("common.notAvailable")}
      </span>
    </div>
  );
};

export default IPLookupPage;
