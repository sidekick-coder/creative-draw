import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import components from 'unplugin-vue-components/vite'
import imports from 'unplugin-auto-import/vite'
import router from 'unplugin-vue-router/vite'
import macros from 'vue-macros/vite'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    return {
        plugins: [
            tailwindcss(),
            router({
                dts: '.output/router.d.ts',
            }),
            components({
                dirs: ['src/components', 'src/layouts'],
                extensions: ['vue'],
                dts: '.output/components.d.ts',
            }),
            imports({
                dirs: ['src/composables', 'src/utils'],
                dts: '.output/imports.d.ts',
                vueTemplate: true,
                imports: [
                    'vue',
                    'vue-router',
                    {
                        from: 'tailwind-merge',
                        imports: ['twMerge'],
                    },
                    {
                        from: '@unhead/vue',
                        imports: ['useHead'],
                    },
                ],
            }),
            macros({
                plugins: {
                    vue: vue(),
                },
            }),
        ],
        resolve: {
            alias: {
                '@': resolve(import.meta.dirname, './src'),
            },
        },
        server: {
            host: env.VITE_HOST === 'true' ? true : 'localhost',
            allowedHosts: ['localhost', env.VITE_ALLOWED_HOST || ''],
        },
    }
})
