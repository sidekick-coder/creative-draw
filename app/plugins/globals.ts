import { vVisible } from '~/directives/vVisible'

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.directive('visible', vVisible as any)
})
