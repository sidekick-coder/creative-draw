import { defineWidget } from '@/utils/defineWidget'

export default defineWidget({
    id: 'object-inspector',
    component: defineAsyncComponent(() => import('@/components/CdObjectInspector.vue')),
})
