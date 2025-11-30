import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // KHÔNG CÒN SỬ DỤNG KEY MẶC ĐỊNH TRONG MÃ NGUỒN
  // Người dùng sẽ nhập key trực tiếp trên giao diện web
  
  return {
    plugins: [react()],
    define: {
      // Giữ lại process.env.API_KEY nếu người dùng muốn dùng biến môi trường khi deploy (tùy chọn)
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "")
    },
    build: {
      target: 'esnext'
    }
  }
})