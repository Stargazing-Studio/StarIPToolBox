import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SubnetInfo {
    networkAddress: string;
    broadcastAddress?: string;
    firstHost: string;
    lastHost: string;
    totalHosts: string;
    usableHosts: string;
    subnetMask?: string;
    wildcardMask?: string;
    binarySubnetMask?: string;
    cidr: number;
    ipVersion: 4 | 6;
}

const SubnetCalcPage: React.FC = () => {
    const { t } = useLanguage();
    const [ipInput, setIpInput] = useState('');
    const [cidrInput, setCidrInput] = useState('24');
    const [ipVersion, setIpVersion] = useState<4 | 6>(4);
    const [result, setResult] = useState<SubnetInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    const calculateSubnet = () => {
        try {
            setError(null);
            const ip = ipInput.trim();
            const cidr = parseInt(cidrInput);

            if (ipVersion === 4) {
                calculateIPv4Subnet(ip, cidr);
            } else {
                calculateIPv6Subnet(ip, cidr);
            }
        } catch (err: any) {
            setError(err.message);
            setResult(null);
        }
    };

    const calculateIPv4Subnet = (ip: string, cidr: number) => {
        if (!isValidIPv4(ip)) throw new Error('Invalid IPv4 address');
        if (cidr < 0 || cidr > 32) throw new Error('CIDR must be 0-32');

        const ipParts = ip.split('.').map(Number);
        const ipInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
        
        const mask = ~((1 << (32 - cidr)) - 1);
        const network = ipInt & mask;
        const broadcast = network | ~mask;
        
        const totalHosts = Math.pow(2, 32 - cidr);
        const usableHosts = cidr === 31 ? 2 : (cidr === 32 ? 1 : totalHosts - 2);

        setResult({
            networkAddress: intToIPv4(network),
            broadcastAddress: intToIPv4(broadcast),
            firstHost: intToIPv4(network + 1),
            lastHost: intToIPv4(broadcast - 1),
            totalHosts: totalHosts.toLocaleString(),
            usableHosts: usableHosts.toLocaleString(),
            subnetMask: intToIPv4(mask),
            wildcardMask: intToIPv4(~mask),
            binarySubnetMask: mask.toString(2).padStart(32, '0').match(/.{1,8}/g)?.join('.') || '',
            cidr,
            ipVersion: 4
        });
    };

    const calculateIPv6Subnet = (ip: string, cidr: number) => {
        if (!isValidIPv6(ip)) throw new Error('Invalid IPv6 address');
        if (cidr < 0 || cidr > 128) throw new Error('CIDR must be 0-128');

        const expanded = expandIPv6(ip);
        const parts = expanded.split(':').map(p => parseInt(p, 16));
        
        const totalBits = BigInt(128 - cidr);
        const totalHosts = totalBits < 64n ? (2n ** totalBits).toString() : '> 10^19';
        
        let networkParts = [...parts];
        let broadcastParts = [...parts];
        
        const fullBytes = Math.floor(cidr / 16);
        const remainingBits = cidr % 16;
        
        for (let i = fullBytes; i < 8; i++) {
            if (i === fullBytes && remainingBits > 0) {
                const mask = 0xFFFF << (16 - remainingBits);
                networkParts[i] = parts[i] & mask;
                broadcastParts[i] = parts[i] | (~mask & 0xFFFF);
            } else if (i > fullBytes) {
                networkParts[i] = 0;
                broadcastParts[i] = 0xFFFF;
            }
        }

        const networkAddr = networkParts.map(p => p.toString(16).padStart(4, '0')).join(':');
        const firstHostParts = [...networkParts];
        firstHostParts[7] += 1;
        const lastHostParts = [...broadcastParts];
        lastHostParts[7] -= 1;

        setResult({
            networkAddress: compressIPv6(networkAddr),
            firstHost: compressIPv6(firstHostParts.map(p => p.toString(16).padStart(4, '0')).join(':')),
            lastHost: compressIPv6(lastHostParts.map(p => p.toString(16).padStart(4, '0')).join(':')),
            totalHosts,
            usableHosts: totalHosts === '> 10^19' ? totalHosts : (BigInt(totalHosts) - 2n).toString(),
            cidr,
            ipVersion: 6
        });
    };

    const isValidIPv4 = (ip: string): boolean => {
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        return parts.every(part => {
            const num = parseInt(part);
            return num >= 0 && num <= 255 && part === num.toString();
        });
    };

    const isValidIPv6 = (ip: string): boolean => {
        const parts = ip.split(':');
        if (parts.length < 3 || parts.length > 8) return false;
        const hasDoubleColon = ip.includes('::');
        if (hasDoubleColon && ip.split('::').length > 2) return false;
        return true;
    };

    const intToIPv4 = (int: number): string => {
        return [
            (int >>> 24) & 255,
            (int >>> 16) & 255,
            (int >>> 8) & 255,
            int & 255
        ].join('.');
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
        const parts = ipv6.split(':');
        const compressed = parts.map(part => part.replace(/^0+/, '') || '0').join(':');
        return compressed.replace(/(^|:)(0:)+/, '::');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t('subnetCalc')}</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">{t('ipVersion')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[4, 6].map(v => (
                                <button
                                    key={v}
                                    onClick={() => {setIpVersion(v as 4 | 6); setCidrInput(v === 4 ? '24' : '64');}}
                                    className={`py-2 px-4 rounded-lg transition text-sm ${
                                        ipVersion === v
                                            ? 'bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                >
                                    IPv{v}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="ip-input" className="block text-sm font-medium text-white mb-2">
                            {t('ipAddress')}
                        </label>
                        <input
                            id="ip-input"
                            type="text"
                            className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
                            placeholder={ipVersion === 4 ? '192.168.1.0' : '2001:db8::1'}
                            value={ipInput}
                            onChange={(e) => setIpInput(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="cidr-input" className="block text-sm font-medium text-white mb-2">
                            {t('cidrPrefix')}
                        </label>
                        <input
                            id="cidr-input"
                            type="number"
                            min="0"
                            max={ipVersion === 4 ? 32 : 128}
                            className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
                            placeholder={ipVersion === 4 ? '24' : '64'}
                            value={cidrInput}
                            onChange={(e) => setCidrInput(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={calculateSubnet}
                        className="w-full bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                    >
                        {t('calculate')}
                    </button>

                    {error && <p className="text-red-400 text-center text-sm">{error}</p>}
                </div>
            </div>

            {result && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-slide-in-up">
                    <h3 className="text-xl font-bold text-white mb-4">{t('results')} (IPv{result.ipVersion})</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ResultItem label={t('networkAddress')} value={result.networkAddress} />
                        {result.broadcastAddress && <ResultItem label={t('broadcast')} value={result.broadcastAddress} />}
                        <ResultItem label={t('firstHost')} value={result.firstHost} />
                        <ResultItem label={t('lastHost')} value={result.lastHost} />
                        {result.subnetMask && <ResultItem label={t('subnetMask')} value={result.subnetMask} />}
                        {result.wildcardMask && <ResultItem label={t('wildcard')} value={result.wildcardMask} />}
                        <ResultItem label={t('cidr')} value={`/${result.cidr}`} />
                        <ResultItem label={t('totalHosts')} value={result.totalHosts} />
                        <ResultItem label={t('usableHosts')} value={result.usableHosts} highlight />
                    </div>

                    {result.binarySubnetMask && (
                        <div className="mt-4 p-4 bg-white/5 rounded-lg">
                            <p className="text-white/70 text-xs mb-1">{t('binarySubnetMask')}:</p>
                            <p className="text-white font-mono text-sm break-all">{result.binarySubnetMask}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ResultItem: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ 
    label, 
    value, 
    highlight 
}) => (
    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
        <span className="text-white/70 text-sm">{label}:</span>
        <span className={`font-mono text-sm ${highlight ? 'text-sky-400 font-bold' : 'text-white'} break-all`}>
            {value}
        </span>
    </div>
);

export default SubnetCalcPage;
