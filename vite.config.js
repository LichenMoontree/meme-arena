import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        root: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'src/pages/home/index.html'),
        login: resolve(__dirname, 'src/pages/login/index.html'),
        register: resolve(__dirname, 'src/pages/register/index.html'),
        upload: resolve(__dirname, 'src/pages/upload/index.html'),
        meme: resolve(__dirname, 'src/pages/meme/index.html'),
        myMemes: resolve(__dirname, 'src/pages/my-memes/index.html'),
        admin: resolve(__dirname, 'src/pages/admin/index.html'),
      },
    },
  },
});