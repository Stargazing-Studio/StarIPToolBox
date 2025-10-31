
export interface ProxyInfo {
    protocol: 'http' | 'https' | 'socks4' | 'socks5';
    host: string;
    port: number;
    user?: string;
    pass?: string;
    originalString: string;
}

export interface ProxyResult extends ProxyInfo {
    status: 'available' | 'unavailable';
    connectionLatency: number;
    websiteLatency?: number;
}
