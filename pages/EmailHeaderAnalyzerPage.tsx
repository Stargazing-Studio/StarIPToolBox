import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  FiMail,
  FiServer,
  FiClock,
  FiMapPin,
  FiAlertCircle,
} from "react-icons/fi";

interface ReceivedHop {
  from: string;
  by: string;
  date: string;
  delay?: string;
}

interface AnalyzedHeader {
  from: string;
  to: string;
  subject: string;
  date: string;
  messageId: string;
  returnPath: string;
  receivedPath: ReceivedHop[];
  spf?: string;
  dkim?: string;
  dmarc?: string;
  sourceIPs: string[];
}

const EmailHeaderAnalyzerPage: React.FC = () => {
  const { t } = useLanguage();
  const [headerText, setHeaderText] = useState("");
  const [analyzed, setAnalyzed] = useState<AnalyzedHeader | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractValue = (lines: string[], key: string): string => {
    const regex = new RegExp(`^${key}:\\s*(.+)$`, "im");
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(regex);
      if (match) {
        let value = match[1];
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].match(/^\s+/)) {
            value += " " + lines[j].trim();
          } else {
            break;
          }
        }
        return value.trim();
      }
    }
    return "";
  };

  const extractIPs = (text: string): string[] => {
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    const ips = text.match(ipRegex) || [];
    return [...new Set(ips)].filter((ip) => {
      const parts = ip.split(".");
      return parts.every((part) => parseInt(part) <= 255);
    });
  };

  const parseReceivedHeaders = (lines: string[]): ReceivedHop[] => {
    const hops: ReceivedHop[] = [];
    const receivedRegex = /^Received:\s*/i;

    for (let i = 0; i < lines.length; i++) {
      if (receivedRegex.test(lines[i])) {
        let receivedLine = lines[i].replace(receivedRegex, "");

        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].match(/^\s+/)) {
            receivedLine += " " + lines[j].trim();
          } else {
            break;
          }
        }

        const fromMatch = receivedLine.match(/from\s+([^\s;]+)/i);
        const byMatch = receivedLine.match(/by\s+([^\s;]+)/i);
        const dateMatch = receivedLine.match(/;\s*(.+)$/);

        if (fromMatch || byMatch) {
          hops.push({
            from: fromMatch ? fromMatch[1] : t("pages.emailHeaderAnalyzer.results.unknown"),
            by: byMatch ? byMatch[1] : t("pages.emailHeaderAnalyzer.results.unknown"),
            date: dateMatch ? dateMatch[1].trim() : "",
          });
        }
      }
    }

    return hops.reverse();
  };

  const analyzeHeader = () => {
    const trimmed = headerText.trim();
    if (!trimmed) {
      setError(t("pages.emailHeaderAnalyzer.errors.empty"));
      setAnalyzed(null);
      return;
    }

    try {
      const lines = trimmed.split("\n");

      const from = extractValue(lines, "From");
      const to = extractValue(lines, "To");
      const subject = extractValue(lines, "Subject");
      const date = extractValue(lines, "Date");
      const messageId = extractValue(lines, "Message-ID");
      const returnPath = extractValue(lines, "Return-Path");
      const spf = extractValue(lines, "Received-SPF");
      const dkim = extractValue(lines, "DKIM-Signature");
      const dmarc = extractValue(lines, "Authentication-Results");

      const receivedPath = parseReceivedHeaders(lines);
      const sourceIPs = extractIPs(trimmed);

      if (!from && !to && receivedPath.length === 0) {
        setError(t("pages.emailHeaderAnalyzer.errors.invalid"));
        setAnalyzed(null);
        return;
      }

      setAnalyzed({
        from,
        to,
        subject,
        date,
        messageId,
        returnPath,
        receivedPath,
        spf,
        dkim,
        dmarc,
        sourceIPs,
      });
      setError(null);
    } catch (err) {
      setError(t("pages.emailHeaderAnalyzer.errors.parsing"));
      setAnalyzed(null);
    }
  };

  const renderInfoCard = (
    icon: React.ReactNode,
    title: string,
    content: string
  ) => {
    if (!content) return null;

    return (
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex items-start gap-3">
          <div className="text-sky-400 mt-1 flex-shrink-0">{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/60 font-medium mb-1">
              {title}
            </div>
            <div className="text-white break-all text-sm">{content}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          {t("pages.emailHeaderAnalyzer.title")}
        </h2>
        <p className="text-white/80 text-sm mb-6">
          {t("pages.emailHeaderAnalyzer.description")}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">
              {t("pages.emailHeaderAnalyzer.input.label")}
            </label>
            <textarea
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder={t("pages.emailHeaderAnalyzer.input.placeholder")}
              rows={10}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all font-mono text-sm resize-vertical"
            />
          </div>

          <button
            onClick={analyzeHeader}
            className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {t("pages.emailHeaderAnalyzer.actions.analyze")}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {analyzed && (
        <>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {t("pages.emailHeaderAnalyzer.results.basicInfo")}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {renderInfoCard(
                <FiMail size={20} />,
                t("pages.emailHeaderAnalyzer.results.from"),
                analyzed.from
              )}
              {renderInfoCard(
                <FiMail size={20} />,
                t("pages.emailHeaderAnalyzer.results.to"),
                analyzed.to
              )}
              {renderInfoCard(
                <FiMail size={20} />,
                t("pages.emailHeaderAnalyzer.results.subject"),
                analyzed.subject
              )}
              {renderInfoCard(
                <FiClock size={20} />,
                t("pages.emailHeaderAnalyzer.results.date"),
                analyzed.date
              )}
              {renderInfoCard(
                <FiMail size={20} />,
                t("pages.emailHeaderAnalyzer.results.messageId"),
                analyzed.messageId
              )}
              {renderInfoCard(
                <FiMail size={20} />,
                t("pages.emailHeaderAnalyzer.results.returnPath"),
                analyzed.returnPath
              )}
            </div>
          </div>

          {analyzed.receivedPath.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                {t("pages.emailHeaderAnalyzer.results.path")}
              </h3>

              <div className="space-y-3">
                {analyzed.receivedPath.map((hop, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 relative"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-blue-500 rounded-l-lg" />
                    <div className="pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FiServer size={16} className="text-sky-400" />
                        <span className="text-white/60 text-sm font-medium">
                          {t("pages.emailHeaderAnalyzer.results.hop")} {index + 1}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="text-white">
                          <span className="text-white/60">
                            {t("pages.emailHeaderAnalyzer.results.fromServer")}:{" "}
                          </span>
                          <span className="font-mono">{hop.from}</span>
                        </div>
                        <div className="text-white">
                          <span className="text-white/60">
                            {t("pages.emailHeaderAnalyzer.results.byServer")}:{" "}
                          </span>
                          <span className="font-mono">{hop.by}</span>
                        </div>
                        {hop.date && (
                          <div className="text-white/60">
                            <FiClock
                              size={14}
                              className="inline mr-1 mb-0.5"
                            />
                            {hop.date}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analyzed.sourceIPs.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                {t("pages.emailHeaderAnalyzer.results.sourceIPs")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {analyzed.sourceIPs.map((ip, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <FiMapPin size={16} className="text-sky-400" />
                      <span className="text-white font-mono text-sm">{ip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(analyzed.spf || analyzed.dkim || analyzed.dmarc) && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FiAlertCircle size={20} />
                {t("pages.emailHeaderAnalyzer.results.authentication")}
              </h3>

              <div className="space-y-3">
                {analyzed.spf && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm text-white/60 font-medium mb-1">
                      SPF
                    </div>
                    <div className="text-white text-sm font-mono break-all">
                      {analyzed.spf}
                    </div>
                  </div>
                )}
                {analyzed.dkim && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm text-white/60 font-medium mb-1">
                      DKIM
                    </div>
                    <div className="text-white text-sm font-mono break-all">
                      {analyzed.dkim.substring(0, 200)}
                      {analyzed.dkim.length > 200 && "..."}
                    </div>
                  </div>
                )}
                {analyzed.dmarc && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm text-white/60 font-medium mb-1">
                      DMARC / Authentication Results
                    </div>
                    <div className="text-white text-sm font-mono break-all">
                      {analyzed.dmarc}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmailHeaderAnalyzerPage;
