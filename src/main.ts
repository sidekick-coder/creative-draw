import App from './App.vue'
import { createApp } from 'vue'
import { vVisible } from './directives/vVisible'
import type { Plugin } from './utils/definePlugin'

const app = createApp(App)

app.directive('visible', vVisible)

Object.values(import.meta.glob('./directives/*.ts', { eager: true }))
    .map((mod: any) => Object.entries(mod))
    .flat()
    .forEach(([name, directive]) => {
        if (name !== 'default' && directive) {
            app.directive(name, directive)
        }
    })

const plugins: Plugin[] = Object.values(import.meta.glob('./plugins/*.ts', { eager: true }))
    .map((mod: any) => mod.default)
    .filter(Boolean)

plugins.forEach((plugin) => plugin({ app }))

app.mount('#app')
