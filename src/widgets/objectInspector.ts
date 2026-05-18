import { defineWidget } from '@/utils/defineWidget'

export default defineWidget({
    id: 'object-inspector',
    icon: 'boxicons:diamond-filled',
    component: defineAsyncComponent(() => import('@/components/CdObjectInspector.vue')),
})
