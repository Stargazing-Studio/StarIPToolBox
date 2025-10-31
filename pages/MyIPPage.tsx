import React, { useEffect, useState } from "react";
import { Spinner } from "../components/Spinner";
import { useLanguage } from "../contexts/LanguageContext";

interface IPInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  timezone?: string;
  postal?: string;
}

const MyIPPage: React.FC = () => {
  const { t } = useLanguage();
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIPInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://ipinfo.io/json?token=");
        if (!response.ok) {
          throw new Error("Failed to fetch IP info");
        }
        const data = await response.json();
        setIpInfo(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching IP info:", err);
        setError(t("pages.myIp.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchIPInfo();
  }, [t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          {t("pages.myIp.title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InfoItem
              label={t("pages.myIp.fields.ip")}
              value={ipInfo?.ip}
              highlight
            />
            <InfoItem
              label={t("pages.myIp.fields.country")}
              value={ipInfo?.country}
            />
            <InfoItem
              label={t("pages.myIp.fields.region")}
              value={ipInfo?.region}
            />
            <InfoItem
              label={t("pages.myIp.fields.city")}
              value={ipInfo?.city}
            />
          </div>

          <div className="space-y-4">
            <InfoItem label={t("pages.myIp.fields.isp")} value={ipInfo?.org} />
            <InfoItem
              label={t("pages.myIp.fields.timezone")}
              value={ipInfo?.timezone}
            />
            <InfoItem
              label={t("pages.myIp.fields.postal")}
              value={ipInfo?.postal}
            />
            <InfoItem
              label={t("pages.myIp.fields.coordinates")}
              value={ipInfo?.loc}
            />
          </div>
        </div>

        {ipInfo?.loc && (
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <p className="text-white/80 text-sm text-center">
              {t("pages.myIp.coordinatesLabel")}: {ipInfo.loc}
            </p>
          </div>
        )}
      </div>
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
        className={`font-mono ${highlight ? "text-sky-400 font-bold text-lg" : "text-white"}`}
      >
        {value || t("common.notAvailable")}
      </span>
    </div>
  );
};

export default MyIPPage;
