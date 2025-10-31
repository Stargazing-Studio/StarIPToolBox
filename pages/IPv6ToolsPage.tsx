import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

type ToolType = 'compress' | 'expand' | 'ipv4-map' | 'validate';

const IPv6ToolsPage: React.FC = () => {
    const { t, getSection } = useLanguage();
    const [input, setInput] = useState('');
    const [toolType, setToolType] = useState<ToolType>('compress');
    const [results, setResults] = useState<{[key: string]: string}>({});
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const summarySection = getSection<{ items?: string[] }>('pages.ipv6Tools.summary');
    const summaryItems = Array.isArray(summarySection.items) ? summarySection.items : [];

    const handleConvert = () => {
        setError(null);
        setResults({});

        try {
            if (toolType === 'ipv4-map') {
                if (!isValidIPv4(input)) throw new Error('Invalid IPv4 address');
                setResults({
                    'IPv4-Mapped IPv6': `::ffff:${input}`,
                    'IPv4-Compatible IPv6': `::${input}`,
                    'Hex Format': `::ffff:${ipv4ToHex(input)}`
                });
            } else if (toolType === 'compress') {
                const compressed = compressIPv6(input);
                const expanded = expandIPv6(input);
                setResults({
                    'Compressed': compressed,
                    'Expanded': expanded,
                    'Canonical': canonicalIPv6(input)
                });
            } else if (toolType === 'expand') {
                const expanded = expandIPv6(input);
                const compressed = compressIPv6(input);
                setResults({
                    'Expanded': expanded,
                    'Compressed': compressed,
                    'Binary': ipv6ToBinary(expanded)
                });
            } else if (toolType === 'validate') {
                const valid = isValidIPv6(input);
                const expanded = valid ? expandIPv6(input) : 'N/A';
                setResults({
                    'Valid': valid ? 'Yes ✓' : 'No ✗',
                    'Type': valid ? getIPv6Type(input) : 'N/A',
                    'Expanded': expanded,
                    'Scope': valid ? getIPv6Scope(expanded) : 'N/A'
                });
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const isValidIPv4 = (ip: string): boolean => {
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        return parts.every(part => {
            const num = parseInt(part);
            return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
        });
    };

    const isValidIPv6 = (ip: string): boolean => {
        if (ip.includes('::')) {
            const parts = ip.split('::');
            if (parts.length > 2) return false;
        }
        const groups = ip.split(':').filter(g => g !== '');
        if (groups.length > 8) return false;
        return groups.every(g => /^[0-9a-fA-F]{1,4}$/.test(g));
    };

    const ipv4ToHex = (ipv4: string): string => {
        return ipv4.split('.').map(part => parseInt(part).toString(16).padStart(2, '0')).join(':');
    };

    const expandIPv6 = (ipv6: string): string => {
        if (ipv6.includes('::')) {
            const parts = ipv6.split('::');
            const leftParts = parts[0] ? parts[0].split(':') : [];
            const rightParts = parts[1] ? parts[1].split(':') : [];
            const zeroCount = 8 - leftParts.length - rightParts.length;
            const zeros = Array(zeroCount).fill('0000');
            return [...leftParts, ...zeros, ...rightParts].map(p => p.padStart(4, '0')).join(':');
        }
        return ipv6.split(':').map(p => p.padStart(4, '0')).join(':');
    };

    const compressIPv6 = (ipv6: string): string => {
        const expanded = expandIPv6(ipv6);
        const parts = expanded.split(':');
        const compressed = parts.map(part => part.replace(/^0+/, '') || '0').join(':');
        
        let maxZeroStart = -1;
        let maxZeroLength = 0;
        let currentZeroStart = -1;
        let currentZeroLength = 0;

        const groups = compressed.split(':');
        groups.forEach((group, i) => {
            if (group === '0') {
                if (currentZeroStart === -1) currentZeroStart = i;
                currentZeroLength++;
            } else {
                if (currentZeroLength > maxZeroLength) {
                    maxZeroStart = currentZeroStart;
                    maxZeroLength = currentZeroLength;
                }
                currentZeroStart = -1;
                currentZeroLength = 0;
            }
        });

        if (currentZeroLength > maxZeroLength) {
            maxZeroStart = currentZeroStart;
            maxZeroLength = currentZeroLength;
        }

        if (maxZeroLength > 1) {
            const before = groups.slice(0, maxZeroStart).join(':');
            const after = groups.slice(maxZeroStart + maxZeroLength).join(':');
            return `${before}::${after}`.replace(/^:|:$/g, '::').replace(/:::/g, '::');
        }

        return compressed;
    };

    const canonicalIPv6 = (ipv6: string): string => {
        const expanded = expandIPv6(ipv6);
        return expanded.toLowerCase();
    };

    const ipv6ToBinary = (ipv6: string): string => {
        const expanded = expandIPv6(ipv6);
        return expanded.split(':').map(group => 
            parseInt(group, 16).toString(2).padStart(16, '0')
        ).join(':');
    };

    const getIPv6Type = (ipv6: string): string => {
        const expanded = expandIPv6(ipv6).toLowerCase();
        if (expanded.startsWith('::ffff:')) return 'IPv4-Mapped';
        if (expanded.startsWith('::')) return 'IPv4-Compatible';
        if (expanded.startsWith('fe80:')) return 'Link-Local';
        if (expanded.startsWith('ff')) return 'Multicast';
        if (expanded.startsWith('fc00:') || expanded.startsWith('fd')) return 'Unique Local';
        if (expanded === '0000:0000:0000:0000:0000:0000:0000:0001') return 'Loopback';
        return 'Global Unicast';
    };

    const getIPv6Scope = (ipv6: string): string => {
        const type = getIPv6Type(ipv6);
        if (type === 'Link-Local') return 'Link';
        if (type === 'Unique Local') return 'Site';
        if (type === 'Multicast') return 'Variable';
        if (type === 'Loopback') return 'Host';
        return 'Global';
    };

    const copyResult = (key: string, value: string) => {
        navigator.clipboard.writeText(value);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t('ipv6Tools')}</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">{t('toolType')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'compress' as ToolType, label: t('compressExpand') },
                                { value: 'ipv4-map' as ToolType, label: t('ipv4ToIpv6') },
                                { value: 'validate' as ToolType, label: t('validateAnalyze') },
                            ].map(tool => (
                                <button
                                    key={tool.value}
                                    onClick={() => setToolType(tool.value)}
                                    className={`py-2 px-4 rounded-lg transition text-sm ${
                                        toolType === tool.value
                                            ? 'bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                >
                                    {tool.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">{t('input')}</label>
                        <input
                            type="text"
                            className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
                            placeholder={toolType === 'ipv4-map' ? '192.168.1.1' : '2001:0db8:0000:0000:0000:8a2e:0370:7334'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleConvert}
                        disabled={!input.trim()}
                        className="w-full bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                        {t('convert')}
                    </button>

                    {error && <p className="text-red-400 text-center text-sm">{error}</p>}
                </div>
            </div>

            {Object.keys(results).length > 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-slide-in-up">
                    <h3 className="text-xl font-bold text-white mb-4">{t('results')}</h3>
                    <div className="space-y-3">
                        {Object.entries(results).map(([key, value]) => (
                            <div key={key} className="bg-white/5 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-white/70 text-sm font-medium">{key}</p>
                                    {value !== 'N/A' && !value.includes('✓') && !value.includes('✗') && (
                                        <button
                                            onClick={() => copyResult(key, value)}
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                                        >
                                            {copied === key ? <FiCheck className="text-green-400" size={16} /> : <FiCopy className="text-white" size={16} />}
                                        </button>
                                    )}
                                </div>
                                <p className="text-white font-mono text-sm break-all">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{t('ipv6AddressTypes')}</h3>
                <ul className="text-white/80 text-sm space-y-2 list-disc list-inside">
                    {summaryItems.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default IPv6ToolsPage;
