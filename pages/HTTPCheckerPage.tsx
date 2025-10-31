import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface HTTPResult {
    status: number;
    statusText: string;
    headers: { [key: string]: string };
    redirected: boolean;
    url: string;
}

const HTTPCheckerPage: React.FC = () => {
    const { t } = useLanguage();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<HTTPResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkURL = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(url, { method: 'HEAD' });
            const headers: { [key: string]: string } = {};
            response.headers.forEach((value, key) => {
                headers[key] = value;
            });

            setResult({
                status: response.status,
                statusText: response.statusText,
                headers,
                redirected: response.redirected,
                url: response.url
            });
        } catch (err: any) {
            setError(err?.message ? `${t('pages.httpChecker.requestFailed')}: ${err.message}` : t('pages.httpChecker.requestFailed'));
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: number) => {
        if (status >= 200 && status < 300) return 'text-green-400';
        if (status >= 300 && status < 400) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t('httpHeaderChecker')}</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">{t('url')}</label>
                        <input
                            type="text"
                            className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && checkURL()}
                        />
                    </div>

                    <button
                        onClick={checkURL}
                        disabled={loading || !url.trim()}
                        className="w-full bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                        {loading ? t('checking') : t('checkHeaders')}
                    </button>

                    {error && <p className="text-red-400 text-center text-sm">{error}</p>}
                </div>
            </div>

            {result && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-slide-in-up">
                    <h3 className="text-xl font-bold text-white mb-4">{t('response')}</h3>
                    
                    <div className="space-y-3 mb-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-white/70 text-xs mb-1">{t('status')}</p>
                            <p className={`text-2xl font-bold ${getStatusColor(result.status)}`}>
                                {result.status} {result.statusText}
                            </p>
                        </div>
                        {result.redirected && (
                            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                                <p className="text-yellow-200 text-sm">Redirected to: {result.url}</p>
                            </div>
                        )}
                    </div>

                    <h4 className="text-lg font-semibold text-white mb-3">Headers</h4>
                    <div className="bg-white/5 rounded-lg p-4 max-h-96 overflow-y-auto custom-scrollbar">
                        {Object.entries(result.headers).map(([key, value]) => (
                            <div key={key} className="py-2 border-b border-white/10 last:border-0">
                                <p className="text-sky-400 text-sm font-medium">{key}</p>
                                <p className="text-white/80 text-xs mt-1 break-all">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HTTPCheckerPage;
