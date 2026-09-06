import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  base:'./',
  build:{
    outDir:'dist-erp',
    copyPublicDir:false,
    rollupOptions:{input:{demo:fileURLToPath(new URL('./kaporta-360.html',import.meta.url)),pilot:fileURLToPath(new URL('./pilot.html',import.meta.url))}}
  }
});
