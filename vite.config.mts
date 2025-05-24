import vue from '@vitejs/plugin-vue';
import tailwindcss from "@tailwindcss/vite";
import components from 'unplugin-vue-components/vite';
import imports from 'unplugin-auto-import/vite';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        vue(),
        components({
            dirs: ['src/components'],
            extensions: ['vue'],
            dts: '.output/components.d.ts',
        }),
        imports({
            dirs: ['src/composables', 'src/utils'],
            dts: '.output/imports.d.ts',
            vueTemplate: true,
            imports: ['vue'],
        })
    ],
    resolve: {
        alias: {
            '@': resolve(import.meta.dirname, './resources/js'),
        },
    },
});
