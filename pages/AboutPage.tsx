import React from "react";
import {
  FiGithub,
  FiStar,
  FiHeart,
  FiCode,
  FiZap,
  FiShield,
  FiGlobe,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { useLanguage } from "../contexts/LanguageContext";

const iconMap: Record<string, IconType> = {
  globe: FiGlobe,
  shield: FiShield,
  zap: FiZap,
  code: FiCode,
};

type FeatureTranslation = {
  icon?: string;
  title?: string;
  desc?: string;
};

type VersionTranslation = {
  title?: string;
  current?: { label?: string; value?: string };
  updated?: { label?: string; value?: string };
  license?: { label?: string; value?: string };
};

const AboutPage: React.FC = () => {
  const { t, getSection } = useLanguage();

  const hero = getSection<{
    subtitle?: string;
    description?: string[];
    buttons?: { github?: string; star?: string };
  }>("pages.about.hero");
  const featuresSection = getSection<{
    title?: string;
    items?: FeatureTranslation[];
  }>("pages.about.features");
  const toolsSection = getSection<{ title?: string; items?: string[] }>(
    "pages.about.tools",
  );
  const versionSection = getSection<VersionTranslation>("pages.about.version");
  const footerSection = getSection<{
    madeWith?: string;
    by?: string;
    tagline?: string;
  }>("pages.about.footer");

  const features = Array.isArray(featuresSection.items)
    ? featuresSection.items
    : [];
  const tools = Array.isArray(toolsSection.items) ? toolsSection.items : [];
  const heroDescription = Array.isArray(hero.description)
    ? hero.description
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-sky-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          {t("pages.about.hero.title")}
        </h1>
        <p className="text-xl text-white/80 mb-6">
          {hero.subtitle ?? t("pages.about.hero.subtitle")}
        </p>
        <div className="text-white/70 max-w-2xl mx-auto mb-8 space-y-3">
          {heroDescription.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          <a
            href="https://github.com/Stargazing-Studio/StarProxyTestTool"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition"
          >
            <FiGithub size={20} />
            {hero.buttons?.github ?? t("pages.about.hero.buttons.github")}
          </a>
          <button
            onClick={() =>
              window.open(
                "https://github.com/Stargazing-Studio/StarProxyTestTool",
                "_blank",
              )
            }
            className="flex items-center gap-2 bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            <FiStar size={20} />
            {hero.buttons?.star ?? t("pages.about.hero.buttons.star")}
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          {featuresSection.title ?? t("pages.about.features.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon ?? ""] ?? FiGlobe;
            return (
              <div
                key={`${feature.title}-${index}`}
                className="bg-white/5 rounded-lg p-4 flex items-start gap-4"
              >
                <div className="p-3 bg-sky-500/20 rounded-lg">
                  <IconComponent size={24} className="text-sky-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 text-sm">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          {toolsSection.title ?? t("pages.about.tools.title")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {tools.map((tool, index) => (
            <div
              key={`${tool}-${index}`}
              className="bg-white/5 rounded-lg p-3 text-white/80 text-sm text-center hover:bg-white/10 transition"
            >
              {tool}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          {versionSection.title ?? t("pages.about.version.title")}
        </h2>
        <div className="space-y-3 text-white/80 text-sm">
          <div className="flex justify-between items-center">
            <span>
              {versionSection.current?.label ??
                t("pages.about.version.current.label")}
            </span>
            <span className="font-mono bg-white/10 px-3 py-1 rounded">
              {versionSection.current?.value ??
                t("pages.about.version.current.value")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>
              {versionSection.updated?.label ??
                t("pages.about.version.updated.label")}
            </span>
            <span>
              {versionSection.updated?.value ??
                t("pages.about.version.updated.value")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>
              {versionSection.license?.label ??
                t("pages.about.version.license.label")}
            </span>
            <span>
              {versionSection.license?.value ??
                t("pages.about.version.license.value")}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500/20 to-sky-500/20 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-white mb-4">
          <span>
            {footerSection.madeWith ?? t("pages.about.footer.madeWith")}
          </span>
          <FiHeart className="text-red-400" />
          <span>{footerSection.by ?? t("pages.about.footer.by")}</span>
          <a
            href="https://github.com/Stargazing-Studio"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:text-sky-400 transition"
          >
            Stargazing Studio
          </a>
        </div>
        <p className="text-white/60 text-sm">
          {footerSection.tagline ?? t("pages.about.footer.tagline")}
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
