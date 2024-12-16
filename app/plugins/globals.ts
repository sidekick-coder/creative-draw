import { vVisible } from '~/directives/vVisible'
import { vLongPress } from '~/directives/vLongPress'

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.directive('visible', vVisible as any)
    vueApp.directive('long-press', vLongPress)
})
