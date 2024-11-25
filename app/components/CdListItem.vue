<script setup lang="ts">
import { NuxtLink } from '#components'

// general
const router = useRouter()
const route = useRoute()

const className = defineProp<string>('class', {
    type: String,
    default: null,
})

const attrs = useAttrs()
const classMap = ref(new Map<string, string>())

const classes = computed(() => {
    const all = Array.from(classMap.value.values()).join(' ')

    return twMerge(all, className.value)
})

classMap.value.set('base', 'flex items-center gap-x-5 px-4 py-3')

// links and path to
const to = defineProp<any>('to', {
    type: [String, Object],
    default: null,
})

function setLinkClasses() {
    classMap.value.set('link', '')

    if (!to.value && !attrs.onClick) return

    classMap.value.set(
        'link',
        `
            cursor-pointer
            transition-colors
            
            hover:bg-primary-300/25
            hover:text-primary-100
        `
    )
}

watch(to, setLinkClasses, { immediate: true })

// active
const active = defineProp<boolean>('active', {
    type: Boolean,
    default: false,
})

const isRouteActive = computed(() => {
    if (!to.value) return false

    const resolved = router.resolve(to.value)

    return route.fullPath === resolved.href
})

function setActive() {
    if (isRouteActive.value || active.value) {
        classMap.value.set('active', 'bg-primary-300/25 !text-primary-100')
        return
    }

    classMap.value.set('active', '')
}

watch([active, isRouteActive], setActive, { immediate: true })
</script>

<template>
    <component :is="to ? NuxtLink : 'div'" :to="to" :class="classes">
        <slot />
    </component>
</template>
