import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 加载环境变量
    const env = loadEnv(mode, process.cwd(), '');
    
    // 如果设置了 VITE_USE_CUSTOM_DOMAIN=true，使用根路径
    // 否则使用 GitHub Pages 子路径
    const base = env.VITE_USE_CUSTOM_DOMAIN === 'true' ? '/' : '/StarProxyTestTool/';
    
    return {
      base: base,
      publicDir: 'public',
      plugins: [react()],
      define: {
        // 将环境变量注入到客户端代码
        'import.meta.env.VITE_WALLPAPER_API_URL': JSON.stringify(env.VITE_WALLPAPER_API_URL || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        rollupOptions: {
          output: {
            manualChunks: undefined
          }
        }
      }
    };
});
