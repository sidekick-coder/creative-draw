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
        'none': '',
        'primary': `
            hover:bg-primary-300/25 hover:text-primary-100
            data-[active=true]:bg-primary-300/25 
        `,
        'body-800': `
            bg-body-800 hover:bg-body-700/25 hover:text-body-100
            data-[active=true]:text-body-100
        `,
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
</script>

<template>
    <component
        :is="to ? NuxtLink : 'div'"
        :to="to"
        :class="classes"
        :data-active="isRouteActive || active"
    >
        <slot />
    </component>
</template>
