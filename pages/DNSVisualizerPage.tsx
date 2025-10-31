import React, { useState } from "react";
import { FiGitBranch } from "react-icons/fi";
import { useLanguage } from "../contexts/LanguageContext";

interface DNSRecord {
  name: string;
  type: string;
  data: string;
  ttl?: number;
}

const recordTypes = ["A", "AAAA", "CNAME", "MX", "TXT", "NS"] as const;

type RecordType = (typeof recordTypes)[number];

type SupportedTranslations = {
  items?: string[];
};

const DNSVisualizerPage: React.FC = () => {
  const { t, getSection } = useLanguage();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<Record<string, DNSRecord[]>>({});
  const [error, setError] = useState<string | null>(null);

  const supportedSection = getSection<SupportedTranslations>(
    "pages.dnsVisualizer.supported",
  );
  const supportedItems = Array.isArray(supportedSection.items)
    ? supportedSection.items
    : [];

  const queryDNS = async (
    domainName: string,
    type: RecordType,
  ): Promise<DNSRecord[]> => {
    try {
      const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domainName)}&type=${type}`,
        { headers: { Accept: "application/dns-json" } },
      );

      if (!response.ok) throw new Error("Query failed");

      const data = await response.json();
      if (!data.Answer) return [];

      return data.Answer.map((answer: any) => ({
        name: answer.name,
        type:
          answer.type === 1
            ? "A"
            : answer.type === 5
              ? "CNAME"
              : answer.type === 15
                ? "MX"
                : answer.type === 16
                  ? "TXT"
                  : answer.type === 28
                    ? "AAAA"
                    : answer.type === 2
                      ? "NS"
                      : "UNKNOWN",
        data: answer.data,
        ttl: answer.TTL,
      }));
    } catch (err) {
      console.error("DNS query error:", err);
      return [];
    }
  };

  const handleQuery = async () => {
    if (!domain.trim()) {
      setError(t("pages.dnsVisualizer.form.errors.domainRequired"));
      return;
    }

    setLoading(true);
    setError(null);
    setRecords({});

    const allRecords: Record<string, DNSRecord[]> = {};

    for (const type of recordTypes) {
      const result = await queryDNS(domain.trim(), type);
      if (result.length > 0) {
        allRecords[type] = result;
      }
    }

    if (Object.keys(allRecords).length === 0) {
      setError(t("pages.dnsVisualizer.form.errors.noRecords"));
    }

    setRecords(allRecords);
    setLoading(false);
  };

  const renderRecordTitle = (type: string) =>
    t("pages.dnsVisualizer.results.recordTitle", { type });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          {t("pages.dnsVisualizer.title")}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t("pages.dnsVisualizer.form.domainLabel")}
            </label>
            <input
              type="text"
              className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
              placeholder={t("pages.dnsVisualizer.form.placeholder")}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
              disabled={loading}
            />
          </div>

          <button
            onClick={handleQuery}
            disabled={loading || !domain.trim()}
            className="w-full bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {loading
              ? t("pages.dnsVisualizer.form.button.loading")
              : t("pages.dnsVisualizer.form.button.idle")}
          </button>

          {error && <p className="text-red-400 text-center text-sm">{error}</p>}
        </div>
      </div>

      {Object.keys(records).length > 0 && (
        <div className="space-y-4 animate-slide-in-up">
          {Object.entries(records).map(([type, typeRecords]) => (
            <div
              key={type}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FiGitBranch />
                {renderRecordTitle(type)}
              </h3>
              <div className="space-y-3">
                {typeRecords.map((record, index) => (
                  <div
                    key={`${record.name}-${index}`}
                    className="bg-white/5 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-white/70 text-xs mb-1">
                          {t("pages.dnsVisualizer.results.fields.name")}
                        </p>
                        <p className="text-white font-mono text-sm break-all mb-3">
                          {record.name}
                        </p>
                        <p className="text-white/70 text-xs mb-1">
                          {t("pages.dnsVisualizer.results.fields.data")}
                        </p>
                        <p className="text-white font-mono text-sm break-all">
                          {record.data}
                        </p>
                      </div>
                      {typeof record.ttl === "number" && (
                        <div className="text-right">
                          <p className="text-white/70 text-xs mb-1">
                            {t("pages.dnsVisualizer.results.fields.ttl")}
                          </p>
                          <p className="text-white text-sm font-medium">
                            {record.ttl}s
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          {t("pages.dnsVisualizer.supported.title")}
        </h3>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-white/80 text-sm list-disc list-inside">
          {supportedItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DNSVisualizerPage;
