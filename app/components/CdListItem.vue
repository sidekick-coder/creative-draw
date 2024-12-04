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
const { classes, set } = useClassBuilder({ class: className })

set('base', 'flex items-center gap-x-5 px-4 py-3 transition-colors')

const color = defineProp<string>('color', {
    type: String,
    default: 'primary',
})

function setColor() {
    const options: Record<typeof color.value, string> = {
        none: '',
        primary: 'hover:bg-primary-300/25 hover:text-primary-100',
    }

    set('color', options[color.value] || '')
}

watch(color, setColor, { immediate: true })

// links and path to
const to = defineProp<any>('to', {
    type: [String, Object],
    default: null,
})

function setLinkClasses() {
    set('link', '')

    if (!to.value && !attrs.onClick) return

    set('link', 'cursor-pointer')
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
        set('active', 'bg-primary-300/25 !text-primary-100')
        return
    }

    set('active', '')
}

watch([active, isRouteActive], setActive, { immediate: true })
</script>

<template>
    <component :is="to ? NuxtLink : 'div'" :to="to" :class="classes">
        <slot />
    </component>
</template>
