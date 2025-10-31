import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
    type: 'sent' | 'received' | 'system';
    content: string;
    timestamp: Date;
}

const WebSocketTestPage: React.FC = () => {
    const [url, setUrl] = useState('wss://echo.websocket.org');
    const [connected, setConnected] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMessage = (type: Message['type'], content: string) => {
        setMessages(prev => [...prev, { type, content, timestamp: new Date() }]);
    };

    const handleConnect = () => {
        try {
            if (connected && wsRef.current) {
                wsRef.current.close();
                return;
            }

            const ws = new WebSocket(url);

            ws.onopen = () => {
                setConnected(true);
                addMessage('system', t('pages.websocketTest.messages.connectionSuccess'));
                wsRef.current = ws;
            };

            ws.onmessage = (event) => {
                addMessage('received', event.data);
            };

            ws.onerror = (error) => {
                addMessage('system', t('pages.websocketTest.messages.connectionError'));
                console.error('WebSocket error:', error);
            };

            ws.onclose = () => {
                setConnected(false);
                addMessage('system', t('pages.websocketTest.messages.connectionClosed'));
                wsRef.current = null;
            };
        } catch (error) {
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : t('pages.websocketTest.messages.unknownError');
            addMessage('system', t('pages.websocketTest.messages.connectionFailed', { error: errorMessage }));
        }
    };

    const handleSend = () => {
        if (!message.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            return;
        }

        wsRef.current.send(message);
        addMessage('sent', message);
        setMessage('');
    };

    const handleClear = () => {
        setMessages([]);
    };

    const instructions = [
        t('pages.websocketTest.instructions.step1'),
        t('pages.websocketTest.instructions.step2'),
        t('pages.websocketTest.instructions.step3'),
        t('pages.websocketTest.instructions.step4'),
        t('pages.websocketTest.instructions.step5')
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t('pages.websocketTest.title')}</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            {t('pages.websocketTest.form.urlLabel')}
                        </label>
                        <input
                            type="text"
                            className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
                            placeholder={t('pages.websocketTest.form.urlPlaceholder')}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={connected}
                        />
                    </div>

                    <button
                        onClick={handleConnect}
                        className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
                            connected 
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-gradient-to-r from-sky-400 to-white text-slate-800 hover:opacity-90'
                        }`}
                    >
                        {connected ? (
                            <>
                                <FiWifiOff />
                                {t('pages.websocketTest.actions.disconnect')}
                            </>
                        ) : (
                            <>
                                <FiWifi />
                                {t('pages.websocketTest.actions.connect')}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {connected && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-slide-in-up">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">{t('pages.websocketTest.messages.sectionTitle')}</h3>
                        <button
                            onClick={handleClear}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-white"
                            title={t('pages.websocketTest.actions.clearMessages')}
                        >
                            <FiTrash2 />
                        </button>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 h-64 overflow-y-auto mb-4 space-y-2">
                        {messages.length === 0 ? (
                            <p className="text-white/60 text-sm text-center py-8">{t('pages.websocketTest.messages.empty')}</p>
                        ) : (
                            messages.map((msg, index) => (
                                <div 
                                    key={index}
                                    className={`p-3 rounded-lg ${
                                        msg.type === 'sent' 
                                            ? 'bg-sky-500/20 ml-auto max-w-[80%]' 
                                            : msg.type === 'received'
                                            ? 'bg-green-500/20 mr-auto max-w-[80%]'
                                            : 'bg-white/10 text-center'
                                    }`}
                                >
                                    <p className="text-white text-sm break-all">{msg.content}</p>
                                    <p className="text-white/50 text-xs mt-1">
                                        {msg.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white/30 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition text-white placeholder:text-white/70"
                            placeholder={t('pages.websocketTest.inputs.messagePlaceholder')}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!message.trim()}
                            className="bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold py-3 px-6 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                        >
                            <FiSend />
                            {t('pages.websocketTest.actions.send')}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{t('pages.websocketTest.instructions.title')}</h3>
                <ul className="text-white/80 text-sm space-y-2 list-disc list-inside">
                    {instructions.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default WebSocketTestPage;
