import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // ƯU TIÊN 1: Lấy key từ biến môi trường (nếu cấu hình trên Vercel/Env file)
  // ƯU TIÊN 2: Sử dụng key mặc định bạn đã cung cấp (để chạy ngay lập tức)
  const apiKey = env.API_KEY || "AIzaSyA6JBPui8X2IRj6X0l8ALi2qV96BmNyuXo";

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY để code hoạt động
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    build: {
      target: 'esnext'
    }
  }
})