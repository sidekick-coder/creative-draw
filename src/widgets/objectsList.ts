import { defineWidget } from '@/utils/defineWidget'

export default defineWidget({
    id: 'objects-list',
    component: defineAsyncComponent(() => import('@/components/CdLayerObjects.vue')),
})
