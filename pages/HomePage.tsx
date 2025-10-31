import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { ProxyInfo, ProxyResult } from '../types';
import { Spinner } from '../components/Spinner';
import { useLanguage } from '../contexts/LanguageContext';

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

interface HomePageTranslations {
    header: {
        title: string;
        subtitle: string;
    };
    importSection: {
        label: string;
        placeholder: string;
        button: {
            idle: string;
            loading: string;
        };
    };
    proxyInput: {
        label: string;
        placeholder: string;
    };
    targetInput: {
        label: string;
        placeholder: string;
    };
    actions: {
        start: string;
        running: string;
    };
    progressText: string;
    copySection: {
        availableSummary: string;
        formatPrefix: string;
    };
    filters: {
        all: string;
    };
    table: {
        proxy: string;
        protocol: string;
        connectionLatency: string;
        websiteLatency: string;
    };
    emptyStates: {
        noneForFilter: string;
        noneOverall: string;
    };
    errors: {
        urlRequired: string;
        importFailed: string;
        noValidProxy: string;
    };
}

const formatTemplate = (template: string, params: Record<string, string | number>) =>
    template.replace(/\{(\w+)\}/g, (_, key) => (key in params ? String(params[key]) : `{${key}}`));

const parseProxies = (proxyInput: string): ProxyInfo[] => {
    const allProxies = proxyInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .flatMap((line): ProxyInfo[] => {
            const match = line.match(/(?:(?<protocol>\w+):\/\/)?(?:(?<user>[^:]+):(?<pass>[^@]+)@)?(?<host>[^:]+):(?<port>\d+)/);
            if (!match || !match.groups) return [];
            
            const { groups } = match;
            const baseProxy = {
                host: groups.host,
                port: parseInt(groups.port, 10),
                user: groups.user,
                pass: groups.pass,
                originalString: line,
            };

            if (groups.protocol) {
                const protocol = groups.protocol.toLowerCase() as ProxyInfo['protocol'];
                if (['http', 'https', 'socks4', 'socks5'].includes(protocol)) {
                    return [{ ...baseProxy, protocol }];
                }
                return []; // Ignore invalid specified protocol
            } else {
                // If no protocol is specified, generate all types
                const protocols: ProxyInfo['protocol'][] = ['http', 'https', 'socks4', 'socks5'];
                return protocols.map(protocol => ({ ...baseProxy, protocol }));
            }
        });

    const uniqueProxies = new Map<string, ProxyInfo>();
    for (const proxy of allProxies) {
        // A unique key considers all parts of the proxy.
        const key = `${proxy.protocol}://${proxy.user || ''}:${proxy.pass || ''}@${proxy.host}:${proxy.port}`;
        if (!uniqueProxies.has(key)) {
            uniqueProxies.set(key, proxy);
        }
    }

    return Array.from(uniqueProxies.values());
};


const simulateProxyTest = (proxy: ProxyInfo, hasUrls: boolean): Promise<ProxyResult> => {
    return new Promise(resolve => {
        const isAvailable = Math.random() > 0.3; // 70% success rate
        const connectionLatency = Math.floor(Math.random() * (1200 - 50 + 1)) + 50;
        
        setTimeout(() => {
            if (!isAvailable) {
                resolve({ ...proxy, status: 'unavailable', connectionLatency });
                return;
            }

            if (hasUrls) {
                const websiteLatency = Math.floor(Math.random() * (1500 - 200 + 1)) + 200;
                resolve({ ...proxy, status: 'available', connectionLatency, websiteLatency });
            } else {
                resolve({ ...proxy, status: 'available', connectionLatency });
            }
        }, connectionLatency);
    });
};

const nonPasswordCopyOptions = [
    { id: 'host:port', label: 'host:port', format: (p: ProxyResult) => `${p.host}:${p.port}` },
    { id: 'protocol://host:port', label: 'protocol://host:port', format: (p: ProxyResult) => `${p.protocol}://${p.host}:${p.port}` },
];
const passwordCopyOptions = [
    { id: 'protocol://user:pass@host:port', label: 'protocol://user:pass@host:port', format: (p: ProxyResult) => p.user && p.pass ? `${p.protocol}://${p.user}:${p.pass}@${p.host}:${p.port}` : `${p.protocol}://${p.host}:${p.port}` },
    { id: 'protocol://host:port:user:pass', label: 'protocol://host:port:user:pass', format: (p: ProxyResult) => p.user && p.pass ? `${p.protocol}://$${p.host}:${p.port}:${p.user}:${p.pass}` : `${p.protocol}://${p.host}:${p.port}` },
    { id: 'host:port@user:pass', label: 'host:port@user:pass', format: (p: ProxyResult) => p.user && p.pass ? `${p.host}:${p.port}@${p.user}:${p.pass}` : `${p.host}:${p.port}` },
    { id: 'host:port:user:pass', label: 'host:port:user:pass', format: (p: ProxyResult) => p.user && p.pass ? `${p.host}:${p.port}:${p.user}:${p.pass}` : `${p.host}:${p.port}` },
];


type FilterType = 'all' | 'http' | 'https' | 'socks4' | 'socks5';

interface HomePageProps {
    results: ProxyResult[];
    setResults: React.Dispatch<React.SetStateAction<ProxyResult[]>>;
    proxyInput: string;
    setProxyInput: React.Dispatch<React.SetStateAction<string>>;
    urlInput: string;
    setUrlInput: React.Dispatch<React.SetStateAction<string>>;
}

const HomePage = ({ results, setResults, proxyInput, setProxyInput, urlInput, setUrlInput }: HomePageProps) => {
    const { t, getSection } = useLanguage();
    const homeTexts = getSection<HomePageTranslations>('pages.home');
    const {
        header,
        importSection,
        proxyInput: proxyInputTexts,
        targetInput: targetInputTexts,
        actions,
        progressText,
        copySection,
        filters: filterTexts,
        table: tableHeaders,
        emptyStates,
        errors
    } = homeTexts;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [filter, setFilter] = useState<FilterType>('all');
    const [urlImport, setUrlImport] = useState('');
    const [importLoading, setImportLoading] = useState(false);

    const [copyOptions, setCopyOptions] = useState(nonPasswordCopyOptions);
    const [copyFormat, setCopyFormat] = useState(copyOptions[0]);
    const [showCopyOptions, setShowCopyOptions] = useState(false);
    const [copiedStatus, setCopiedStatus] = useState<{[key: string]: boolean}>({});
    const [copiedAll, setCopiedAll] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    
    const filteredResults = useMemo(() => {
        return results.filter(r => filter === 'all' || r.protocol === filter);
    }, [results, filter]);

    useEffect(() => {
        const hasPasswordProxies = filteredResults.some(p => p.user && p.pass);
        const newOptions = hasPasswordProxies ? [...nonPasswordCopyOptions, ...passwordCopyOptions] : nonPasswordCopyOptions;
        setCopyOptions(newOptions);
        if (!newOptions.find(opt => opt.id === copyFormat.id)) {
            setCopyFormat(newOptions[0]);
        }
    }, [filteredResults, copyFormat.id]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowCopyOptions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Effect for auto-scrolling
    useEffect(() => {
        if (!isLoading && results.length > 0) {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isLoading, results.length]);

    const handleCopyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedStatus({ [key]: true });
        setTimeout(() => setCopiedStatus({ [key]: false }), 2000);
    };
    
     const handleCopyAll = () => {
        const textToCopy = filteredResults.map(p => copyFormat.format(p)).join('\n');
        navigator.clipboard.writeText(textToCopy);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    const handleImportFromURL = async () => {
        if (!urlImport.trim()) {
            setError(errors.urlRequired);
            return;
        }

        try {
            setImportLoading(true);
            setError(null);
            const response = await fetch(urlImport.trim());
            if (!response.ok) {
                throw new Error('NETWORK_ERROR');
            }
            const text = await response.text();
            setProxyInput(text);
            setError(null);
        } catch (err: any) {
            console.error('Import error:', err);
            setError(errors.importFailed);
        } finally {
            setImportLoading(false);
        }
    };

    const handleTest = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setResults([]);
        setProgress(0);
        setFilter('all');

        const proxies = parseProxies(proxyInput);
        if (proxies.length === 0) {
            setError(errors.noValidProxy);
            setIsLoading(false);
            return;
        }

        const hasUrls = urlInput.trim().length > 0;
        const testPromises = proxies.map((p, index) => 
            simulateProxyTest(p, hasUrls).then(result => {
                setProgress(((index + 1) / proxies.length) * 100);
                return result;
            })
        );
        
        const initialResults = await Promise.all(testPromises);
        const availableProxies = initialResults.filter(r => r.status === 'available');

        setResults(availableProxies);
        setIsLoading(false);
    }, [proxyInput, urlInput, setResults]);
    
    const getLatencyColor = (latency: number): string => {
        if (latency < 300) return 'text-green-400';
        if (latency < 800) return 'text-orange-400';
        return 'text-red-500';
    };


    return (
        <div className="flex flex-col items-center animate-fade-in">
            <header className="text-center mb-10">
                <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    {header.title}
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-white/80" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>
                    {header.subtitle}
                </p>
            </header>

            <div className="w-full max-w-4xl p-4 sm:p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 animate-slide-in-up">
                <div className="mb-6 p-4 bg-white/5 rounded-lg">
                    <label htmlFor="url-import" className="block text-sm font-medium text-white mb-2">
                        {importSection.label}
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="url-import"
                            type="text"
                            className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
                            placeholder={importSection.placeholder}
                            value={urlImport}
                            onChange={(e) => setUrlImport(e.target.value)}
                            disabled={importLoading}
                        />
                        <button
                            onClick={handleImportFromURL}
                            disabled={importLoading || !urlImport.trim()}
                            className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {importLoading ? importSection.button.loading : importSection.button.idle}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="proxy-input" className="block text-sm font-medium text-white mb-2">
                            {proxyInputTexts.label}
                        </label>
                        <textarea
                            id="proxy-input"
                            rows={6}
                            className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70 resize-none"
                            placeholder={proxyInputTexts.placeholder}
                            value={proxyInput}
                            onChange={(e) => setProxyInput(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="url-input" className="block text-sm font-medium text-white mb-2">
                            {targetInputTexts.label}
                        </label>
                        <textarea
                            id="url-input"
                            rows={6}
                            className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70 resize-none"
                            placeholder={targetInputTexts.placeholder}
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={handleTest}
                        disabled={isLoading || !proxyInput}
                        className="w-full bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                        {isLoading ? actions.running : actions.start}
                    </button>
                </div>
                 {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            </div>
            
            {isLoading && (
                 <div className="w-full max-w-4xl mt-6">
                    <p className="text-center text-white/80 mb-2">{formatTemplate(progressText, { value: Math.round(progress) })}</p>
                    <div className="w-full bg-white/20 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-sky-400 to-white h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.2s ease-in-out' }}></div>
                    </div>
                 </div>
            )}
            
            {!isLoading && results.length > 0 && (
                <div ref={resultsRef} className="w-full max-w-4xl mt-8 p-4 sm:p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                        <h2 className="text-2xl font-bold text-white">{formatTemplate(copySection.availableSummary, { available: filteredResults.length, total: results.length })}</h2>
                        <div className="flex items-center gap-2">
                            <div ref={dropdownRef} className="relative">
                                <button onClick={() => setShowCopyOptions(!showCopyOptions)} className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-lg transition">
                                    {formatTemplate(copySection.formatPrefix, { label: copyFormat.label })} <ChevronDownIcon />
                                </button>
                                {showCopyOptions && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white/20 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl z-10">
                                        {copyOptions.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => { setCopyFormat(opt); setShowCopyOptions(false); }}
                                                className="w-full text-left text-sm px-4 py-2 text-white hover:bg-white/20 transition"
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button onClick={handleCopyAll} className="text-sm bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold py-2 px-4 rounded-lg hover:opacity-90 transition">
                                {copiedAll ? t('common.copied') : t('common.copyAll')}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {(['all', 'http', 'https', 'socks4', 'socks5'] as const).map((proto) => {
                            const isActive = filter === proto;
                            const text = proto === 'all' ? filterTexts.all : proto.toUpperCase();
                            return (
                                <button
                                    key={proto}
                                    onClick={() => setFilter(proto)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                                        isActive
                                            ? 'bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold shadow-md'
                                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                                    }`}
                                >
                                    {text}
                                </button>
                            );
                        })}
                    </div>
                    
                    {filteredResults.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-white">
                                <thead className="border-b border-white/20 text-white/80">
                                    <tr>
                                        <th className="p-2 sm:p-3">{tableHeaders.proxy}</th>
                                        <th className="p-2 sm:p-3">{tableHeaders.protocol}</th>
                                        <th className="p-2 sm:p-3">{tableHeaders.connectionLatency}</th>
                                        {urlInput.trim().length > 0 && <th className="p-2 sm:p-3">{tableHeaders.websiteLatency}</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResults.map((r, index) => (
                                        <tr key={`${r.originalString}-${r.protocol}-${index}`} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                                            <td className="p-2 sm:p-3 font-mono">
                                                <button onClick={() => handleCopyToClipboard(copyFormat.format(r), `${r.originalString}-${r.protocol}`)} className="flex items-center gap-2 hover:text-sky-400 transition-colors">
                                                    {copiedStatus[`${r.originalString}-${r.protocol}`] ? t('common.copied') : `${r.host}:${r.port}`}
                                                </button>
                                            </td>
                                            <td className="p-2 sm:p-3"><span className="bg-white/20 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">{r.protocol.toUpperCase()}</span></td>
                                            <td className={`p-2 sm:p-3 font-semibold whitespace-nowrap ${getLatencyColor(r.connectionLatency)}`}>
                                                {r.connectionLatency}ms
                                            </td>
                                            {urlInput.trim().length > 0 && (
                                                <td className="p-2 sm:p-3 font-semibold text-cyan-400 whitespace-nowrap">
                                                    {r.websiteLatency ? `${r.websiteLatency}ms` : t('common.notAvailable')}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     ) : (
                        <p className="text-center text-white/80 py-8">{emptyStates.noneForFilter}</p>
                     )}
                </div>
            )}
             {!isLoading && results.length === 0 && !error && proxyInput && (
                <div className="w-full max-w-4xl mt-8 p-8 text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl">
                    <p className="text-white">{emptyStates.noneOverall}</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;