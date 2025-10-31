import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const WebRTCTestPage: React.FC = () => {
  const { t, getSection } = useLanguage();
  const [ips, setIps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const infoSection = getSection<{ items?: string[] }>("pages.webRtcTest.info");
  const infoItems = Array.isArray(infoSection.items) ? infoSection.items : [];

  useEffect(() => {
    detectIPs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectIPs = () => {
    setLoading(true);
    const foundIPs = new Set<string>();

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.createDataChannel("");
    pc.createOffer().then((offer) => pc.setLocalDescription(offer));

    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) {
        setLoading(false);
        return;
      }

      const candidateStr = ice.candidate.candidate;
      const ipRegex =
        /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/i;
      const match = candidateStr.match(ipRegex);

      if (match && match[1]) {
        const ip = match[1];
        if (!foundIPs.has(ip)) {
          foundIPs.add(ip);
          setIps(Array.from(foundIPs));
        }
      }
    };

    setTimeout(() => {
      pc.close();
      setLoading(false);
    }, 3000);
  };

  const categorizeIP = (ip: string): { type: string; isPrivate: boolean } => {
    if (ip.includes(":")) {
      return {
        type: "IPv6",
        isPrivate: ip.startsWith("fe80") || ip.startsWith("fd"),
      };
    }

    const parts = ip.split(".").map(Number);
    const isPrivate =
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127;

    return { type: "IPv4", isPrivate };
  };

  const hasPublicIP = ips.some((ip) => !categorizeIP(ip).isPrivate);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          {t("pages.webRtcTest.title")}
        </h2>
        <p className="text-white/80 text-sm mb-6">
          {t("pages.webRtcTest.description")}
        </p>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white/70 mt-4">
              {t("pages.webRtcTest.loading.status")}
            </p>
          </div>
        )}

        {!loading && ips.length === 0 && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <p className="text-yellow-200 text-sm">
              {t("pages.webRtcTest.results.none")}
            </p>
          </div>
        )}

        {!loading && ips.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t("pages.webRtcTest.results.detectedTitle")}
              </h3>
              <div className="space-y-2">
                {ips.map((ip, index) => {
                  const { type, isPrivate } = categorizeIP(ip);
                  return (
                    <div
                      key={`${ip}-${index}`}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isPrivate ? "bg-green-500/20" : "bg-red-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded ${
                            isPrivate
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {type}
                        </span>
                        <span className="font-mono text-white break-all">
                          {ip}
                        </span>
                      </div>
                      <span
                        className={`text-sm ${isPrivate ? "text-green-300" : "text-red-300"}`}
                      >
                        {isPrivate
                          ? t("pages.webRtcTest.results.labels.private")
                          : t("pages.webRtcTest.results.labels.public")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {hasPublicIP && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-200 text-sm font-semibold mb-2">
                  {t("pages.webRtcTest.warning.title")}
                </p>
                <p className="text-red-200 text-sm">
                  {t("pages.webRtcTest.warning.description")}
                </p>
              </div>
            )}

            <button
              onClick={detectIPs}
              className="w-full bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
            >
              {t("pages.webRtcTest.actions.retry")}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          {t("pages.webRtcTest.info.title")}
        </h3>
        <ul className="text-white/80 text-sm space-y-2 list-disc list-inside">
          {infoItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WebRTCTestPage;
