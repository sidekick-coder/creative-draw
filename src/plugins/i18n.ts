import { createI18n } from 'vue-i18n'
import en from '@/lang/en'

const i18n = createI18n({
    legacy: false,
    defaultLocale: 'en',
    fallbackLocale: 'en',
    messages: {
        en,
    },
})

export default definePlugin(({ app }) => {
    app.use(i18n)
})
