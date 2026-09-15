import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      // Mỗi khi React gọi '/api/xxx', Vite sẽ ngầm chuyển nó thành 'http://localhost:8080/api/xxx'
      '/api': {
        target: 'http://localhost:8080', // Thay 8080 bằng Port Backend của bạn (3000, 3001, 8080...)
        changeOrigin: true,
        secure: false,
      }
    }
  },
})