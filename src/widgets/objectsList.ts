import { defineWidget } from '@/utils/defineWidget'

export default defineWidget({
    id: 'objects-list',
    icon: 'mdi:cube',
    minWidth: 300,
    minHeight: 500,
    component: defineAsyncComponent(() => import('@/components/CdLayerObjects.vue')),
})
