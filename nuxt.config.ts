// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    ssr: false,
    app: {
        head: {
            title: 'Creative draw',
            meta: [
                {
                    name: 'viewport',
                    content:
                        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
                },
            ],
        },
    },
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },
    modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n', '@vue-macros/nuxt', '@nuxt/icon'],
    future: {
        compatibilityVersion: 4,
    },
    i18n: {
        defaultLocale: 'en',
        locales: [{ code: 'en', iso: 'en-US', file: 'en-US.ts' }],
    },
    imports: {
        presets: [
            {
                package: '@vueuse/core',
                ignore: ['useFetch', 'useImage', 'toRef', 'toRefs', 'toValue'],
            },
            {
                from: 'tailwind-merge',
                imports: ['twMerge'],
            },
            {
                from: 'lodash-es',
                imports: ['debounce', 'throttle', 'camelCase'],
            },
        ],
    },
    typescript: {
        tsConfig: {
            compilerOptions: {
                types: ['wicg-file-system-access'],
            },
        },
    },
})
