import React, { useState } from 'react';
import { FiCopy, FiCheck, FiDownload } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

type ServerType = 'apache' | 'nginx' | 'iptables' | 'firewalld' | 'windows';

interface BlockRulesInstruction {
    title: string;
    description: string;
    code?: string;
}

interface BlockRulesTranslations {
    ipListPlaceholder: string;
    serverTypes: Array<{ value: ServerType; label: string; desc: string }>;
    instructions: BlockRulesInstruction[];
}

const BlockRulesPage: React.FC = () => {
    const { t, getSection } = useLanguage();
    const {
        ipListPlaceholder = '192.168.1.1\n10.0.0.1\n172.16.0.1',
        serverTypes: serverTypesData = [],
        instructions = []
    } = getSection<BlockRulesTranslations>('pages.blockRules');
    const [ips, setIps] = useState('');
    const [serverType, setServerType] = useState<ServerType>('apache');
    const [rules, setRules] = useState('');
    const [copied, setCopied] = useState(false);

    const generateRules = () => {
        const ipList = ips.split('\n').filter(ip => ip.trim());
        if (ipList.length === 0) return;

        let generated = '';
        
        switch (serverType) {
            case 'apache':
                generated = ipList.map(ip => `deny from ${ip.trim()}`).join('\n');
                break;
            case 'nginx':
                generated = ipList.map(ip => `deny ${ip.trim()};`).join('\n');
                break;
            case 'iptables':
                generated = ipList.map(ip => `iptables -A INPUT -s ${ip.trim()} -j DROP`).join('\n');
                break;
            case 'firewalld':
                generated = ipList.map(ip => `firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=${ip.trim()} drop'`).join('\n');
                generated += '\nfirewall-cmd --reload';
                break;
            case 'windows':
                generated = ipList.map(ip => `netsh advfirewall firewall add rule name="Block ${ip.trim()}" dir=in action=block remoteip=${ip.trim()}`).join('\n');
                break;
        }

        setRules(generated);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(rules);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const extension = serverType === 'apache' ? 'htaccess' : 
                         serverType === 'nginx' ? 'conf' :
                         serverType === 'windows' ? 'bat' : 'sh';
        const blob = new Blob([rules], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `block-rules.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const serverTypes = serverTypesData.length > 0 ? serverTypesData : [
        { value: 'apache' as ServerType, label: 'Apache', desc: '.htaccess' },
        { value: 'nginx' as ServerType, label: 'Nginx', desc: 'nginx.conf' },
        { value: 'iptables' as ServerType, label: 'iptables', desc: 'Linux Firewall' },
        { value: 'firewalld' as ServerType, label: 'firewalld', desc: 'RHEL/CentOS' },
        { value: 'windows' as ServerType, label: 'Windows', desc: 'Firewall' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t('blockRulesGenerator')}</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">{t('ipList')}</label>
                        <textarea
                            rows={8}
                            className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70 resize-none"
                            placeholder={ipListPlaceholder}
                            value={ips}
                            onChange={(e) => setIps(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">{t('serverFirewallType')}</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {serverTypes.map(type => (
                                <button
                                    key={type.value}
                                    onClick={() => setServerType(type.value)}
                                    className={`py-3 px-4 rounded-lg transition text-sm ${
                                        serverType === type.value
                                            ? 'bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                >
                                    <div className="font-semibold">{type.label}</div>
                                    <div className="text-xs opacity-70">{type.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={generateRules}
                        disabled={!ips.trim()}
                        className="w-full bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                        {t('generateRules')}
                    </button>
                </div>
            </div>

            {rules && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-slide-in-up">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">{t('generatedRules')} ({serverType})</h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleCopy} 
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition text-sm"
                            >
                                {copied ? <><FiCheck /> {t('copied')}</> : <><FiCopy /> {t('copy')}</>}
                            </button>
                            <button 
                                onClick={handleDownload} 
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition text-sm"
                            >
                                <FiDownload /> {t('download')}
                            </button>
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 max-h-96 overflow-y-auto custom-scrollbar">
                        <pre className="text-white text-xs font-mono whitespace-pre-wrap">{rules}</pre>
                    </div>
                </div>
            )}

            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{t('usageInstructions')}</h3>
                <div className="text-white/80 text-sm space-y-3">
                    {instructions.map((item, index) => (
                        <div key={`${item.title}-${index}`}>
                            <strong className="text-white">{item.title}</strong>
                            <p className="mt-1">
                                {item.description}
                                {item.code && (
                                    <>
                                        {' '}
                                        <code className="bg-white/10 px-1 rounded">{item.code}</code>
                                    </>
                                )}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlockRulesPage;
