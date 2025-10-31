import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

interface TestResult {
    name: string;
    status: 'safe' | 'warning' | 'danger';
    details: string;
    data?: any;
}

interface BrowserTestInstruction {
    title: string;
    description: string;
}

const defaultBrowserTestInstructions: BrowserTestInstruction[] = [
    {
        title: 'WebRTC leak',
        description: 'Checks whether WebRTC exposes your real IP address.'
    },
    {
        title: 'IP consistency',
        description: 'Compares IP addresses returned by multiple services to detect mismatches.'
    },
    {
        title: 'Timezone & language',
        description: 'Highlights potential mismatches between browser language preferences and timezone.'
    },
    {
        title: 'Canvas fingerprint',
        description: 'Evaluates how unique your Canvas rendering fingerprint is.'
    },
    {
        title: 'Font fingerprint',
        description: 'Lists fonts exposed to the browser that may aid fingerprinting.'
    },
    {
        title: 'Hardware attributes',
        description: 'Summarises visible information about your device screen and platform.'
    }
];

const defaultHardwareLabels = {
    screenResolution: 'Screen resolution',
    availableScreen: 'Available screen',
    colorDepth: 'Color depth',
    cpuCores: 'CPU cores',
    memory: 'Memory',
    platform: 'Platform',
    userAgent: 'User agent'
};

const BrowserTestPage: React.FC = () => {
    const { t, getSection } = useLanguage();

    const instructionSection = getSection<unknown>('pages.browserTest.instructions');
    const instructionList = Array.isArray(instructionSection) && instructionSection.length > 0
        ? (instructionSection as BrowserTestInstruction[])
        : defaultBrowserTestInstructions;

    const hardwareLabelsSection = getSection<Record<string, string>>('pages.browserTest.hardware.labels');
    const hardwareLabels = { ...defaultHardwareLabels, ...(hardwareLabelsSection || {}) };
    const notAvailableLabel = t('common.notAvailable');

    const [results, setResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        runAllTests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const runAllTests = async () => {
        setLoading(true);
        setProgress(0);
        const testResults: TestResult[] = [];
        const totalTests = 6;
        let completed = 0;

        const pushResult = (result: TestResult) => {
            testResults.push(result);
            completed += 1;
            setProgress((completed / totalTests) * 100);
            setResults([...testResults]);
        };

        const webrtcResult = await testWebRTCLeak();
        pushResult(webrtcResult);

        const ipConsistency = await testIPConsistency();
        pushResult(ipConsistency);

        const timezoneResult = testTimezoneLanguage();
        pushResult(timezoneResult);

        const canvasResult = await testCanvasFingerprint();
        pushResult(canvasResult);

        const fontResult = await testFontFingerprint();
        pushResult(fontResult);

        const hardwareResult = testHardwareAttributes();
        pushResult(hardwareResult);

        setLoading(false);
    };

    const testWebRTCLeak = (): Promise<TestResult> => {
        return new Promise((resolve) => {
            const ips = new Set<string>();
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            pc.createDataChannel('');
            pc.createOffer().then(offer => pc.setLocalDescription(offer));

            pc.onicecandidate = (ice) => {
                if (!ice || !ice.candidate) {
                    pc.close();
                    const ipArray = Array.from(ips);
                    const hasPublicIP = ipArray.some(ip => !isPrivateIP(ip));

                    resolve({
                        name: t('pages.browserTest.tests.webrtc.name'),
                        status: hasPublicIP ? 'danger' : 'safe',
                        details: hasPublicIP
                            ? t('pages.browserTest.tests.webrtc.details.public', { count: ipArray.length })
                            : t('pages.browserTest.tests.webrtc.details.private', { count: ipArray.length }),
                        data: ipArray
                    });
                    return;
                }

                const match = ice.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
                if (match) ips.add(match[1]);
            };

            setTimeout(() => {
                pc.close();
                const ipArray = Array.from(ips);
                resolve({
                    name: t('pages.browserTest.tests.webrtc.name'),
                    status: ipArray.length > 0 ? 'warning' : 'safe',
                    details: t('pages.browserTest.tests.webrtc.details.countOnly', { count: ipArray.length }),
                    data: ipArray
                });
            }, 2000);
        });
    };

    const testIPConsistency = async (): Promise<TestResult> => {
        try {
            const [ip1Response, ip2Response] = await Promise.all([
                fetch('https://api.ipify.org?format=json'),
                fetch('https://api.ip.sb/ip')
            ]);

            const ip1 = (await ip1Response.json()).ip;
            const ip2 = (await ip2Response.text()).trim();

            const consistent = ip1 === ip2;

            return {
                name: t('pages.browserTest.tests.ipConsistency.name'),
                status: consistent ? 'safe' : 'warning',
                details: consistent
                    ? t('pages.browserTest.tests.ipConsistency.details.consistent')
                    : t('pages.browserTest.tests.ipConsistency.details.inconsistent', { ip1, ip2 }),
                data: { ip1, ip2 }
            };
        } catch (error) {
            return {
                name: t('pages.browserTest.tests.ipConsistency.name'),
                status: 'warning',
                details: t('pages.browserTest.tests.ipConsistency.details.failed'),
                data: null
            };
        }
    };

    const testTimezoneLanguage = (): TestResult => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const language = navigator.language;
        const languages = navigator.languages;

        const commonMismatches = [
            { tz: 'Asia/Shanghai', lang: 'en-US' },
            { tz: 'America/New_York', lang: 'zh-CN' }
        ];

        const hasMismatch = commonMismatches.some(
            m => timezone.includes(m.tz) && language.includes(m.lang)
        );

        return {
            name: t('pages.browserTest.tests.timezone.name'),
            status: hasMismatch ? 'warning' : 'safe',
            details: hasMismatch
                ? t('pages.browserTest.tests.timezone.details.mismatch')
                : t('pages.browserTest.tests.timezone.details.normal'),
            data: { timezone, language, languages }
        };
    };

    const testCanvasFingerprint = async (): Promise<TestResult> => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return {
                name: t('pages.browserTest.tests.canvas.name'),
                status: 'warning',
                details: t('pages.browserTest.tests.canvas.details.noContext'),
                data: null
            };
        }

        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('StarIPToolbox', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('StarIPToolbox', 4, 17);

        const dataURL1 = canvas.toDataURL();

        await new Promise(resolve => setTimeout(resolve, 100));
        const dataURL2 = canvas.toDataURL();

        const isConsistent = dataURL1 === dataURL2;
        const hash = await hashString(dataURL1);

        return {
            name: t('pages.browserTest.tests.canvas.name'),
            status: isConsistent ? 'safe' : 'warning',
            details: isConsistent
                ? t('pages.browserTest.tests.canvas.details.stable')
                : t('pages.browserTest.tests.canvas.details.unstable'),
            data: { hash: `${hash.substring(0, 16)}...` }
        };
    };

    const testFontFingerprint = async (): Promise<TestResult> => {
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        const testFonts = [
            'Arial', 'Verdana', 'Times New Roman', 'Courier New',
            'SimSun', 'Microsoft YaHei', 'PingFang SC', 'Helvetica',
            'Comic Sans MS', 'Impact', 'Tahoma', 'Trebuchet MS'
        ];

        const detectedFonts: string[] = [];
        const span = document.createElement('span');
        span.style.position = 'absolute';
        span.style.left = '-9999px';
        span.style.fontSize = '72px';
        span.innerHTML = 'mmmmmmmmmmlli';
        document.body.appendChild(span);

        const baseDimensions: Record<string, { width: number; height: number }> = {};

        baseFonts.forEach(baseFont => {
            span.style.fontFamily = baseFont;
            baseDimensions[baseFont] = {
                width: span.offsetWidth,
                height: span.offsetHeight
            };
        });

        testFonts.forEach(font => {
            let detected = false;
            baseFonts.forEach(baseFont => {
                span.style.fontFamily = `"${font}", ${baseFont}`;
                const dimension = {
                    width: span.offsetWidth,
                    height: span.offsetHeight
                };
                if (dimension.width !== baseDimensions[baseFont].width ||
                    dimension.height !== baseDimensions[baseFont].height) {
                    detected = true;
                }
            });
            if (detected) detectedFonts.push(font);
        });

        document.body.removeChild(span);

        return {
            name: t('pages.browserTest.tests.font.name'),
            status: detectedFonts.length > 8 ? 'warning' : 'safe',
            details: t('pages.browserTest.tests.font.details.detected', { count: detectedFonts.length }),
            data: detectedFonts
        };
    };

    const testHardwareAttributes = (): TestResult => {
        const data = {
            [hardwareLabels.screenResolution]: `${screen.width}x${screen.height}`,
            [hardwareLabels.availableScreen]: `${screen.availWidth}x${screen.availHeight}`,
            [hardwareLabels.colorDepth]: `${screen.colorDepth}bit`,
            [hardwareLabels.cpuCores]: navigator.hardwareConcurrency || notAvailableLabel,
            [hardwareLabels.memory]: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory}GB` : notAvailableLabel,
            [hardwareLabels.platform]: navigator.platform,
            [hardwareLabels.userAgent]: `${navigator.userAgent.substring(0, 50)}...`
        };

        const uniquenessScore = calculateUniqueness(data);

        return {
            name: t('pages.browserTest.tests.hardware.name'),
            status: uniquenessScore > 70 ? 'warning' : 'safe',
            details: t('pages.browserTest.tests.hardware.details.score', { value: uniquenessScore }),
            data
        };
    };

    const isPrivateIP = (ip: string): boolean => {
        const parts = ip.split('.').map(Number);
        return (
            parts[0] === 10 ||
            parts[0] === 127 ||
            (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
            (parts[0] === 192 && parts[1] === 168)
        );
    };

    const hashString = async (str: string): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const calculateUniqueness = (data: Record<string, unknown>): number => {
        const serialized = JSON.stringify(data);
        return Math.min(95, 50 + serialized.length / 20);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'safe':
                return <FiCheck className="text-green-400" size={24} />;
            case 'warning':
                return <FiAlertTriangle className="text-yellow-400" size={24} />;
            case 'danger':
                return <FiX className="text-red-400" size={24} />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'safe':
                return 'bg-green-500/20 border-green-500/50';
            case 'warning':
                return 'bg-yellow-500/20 border-yellow-500/50';
            case 'danger':
                return 'bg-red-500/20 border-red-500/50';
            default:
                return 'bg-white/5 border-white/20';
        }
    };

    const heroTitle = t('pages.browserTest.title');
    const heroSubtitle = t('pages.browserTest.subtitle');
    const progressLabelText = t('pages.browserTest.progressLabel', { value: Math.round(progress) });
    const retestButtonText = loading ? t('pages.browserTest.buttons.loading') : t('pages.browserTest.buttons.retry');
    const instructionsTitle = t('pages.browserTest.instructionsTitle');

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{heroTitle}</h2>
                <p className="text-white/80 text-sm mb-6">
                    {heroSubtitle}
                </p>

                {loading && (
                    <div className="mb-6">
                        <p className="text-center text-white/80 mb-2">{progressLabelText}</p>
                        <div className="w-full bg-white/20 rounded-full h-2.5">
                            <div
                                className="bg-gradient-to-r from-sky-400 to-white h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <button
                    onClick={runAllTests}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-sky-400 to-white text-slate-800 font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                    {retestButtonText}
                </button>
            </div>

            {results.length > 0 && (
                <div className="space-y-4">
                    {results.map((result, index) => (
                        <div
                            key={`${result.name}-${index}`}
                            className={`bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border p-6 animate-slide-in-up ${getStatusColor(result.status)}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    {getStatusIcon(result.status)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-2">{result.name}</h3>
                                    <p className="text-white/80 text-sm mb-3">{result.details}</p>
                                    {result.data && (
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <pre className="text-xs text-white/70 overflow-x-auto">
                                                {typeof result.data === 'object'
                                                    ? JSON.stringify(result.data, null, 2)
                                                    : result.data}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{instructionsTitle}</h3>
                <div className="text-white/80 text-sm space-y-2">
                    {instructionList.map((item, index) => (
                        <p key={`${item.title}-${index}`}>
                            • <strong>{item.title}</strong>: {item.description}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BrowserTestPage;
