<script setup lang="ts">
import { RouterLink } from 'vue-router'

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

const colorOptions = ref({
    'none': '',
    'primary': '' as string | string[],
    'danger': '' as string | string[],
    'body-800': '' as string | string[],
})

const color = defineProp<keyof typeof colorOptions.value>('color', {
    type: String,
    default: 'none',
})

function setColor() {
    const value = (colorOptions.value as any)[color.value] || ''

    set('color', value)
}

watch([color, colorOptions], setColor, { immediate: true })

// variant
const variant = defineProp<'text' | 'filled'>('variant', {
    type: String,
    default: 'filled',
})

function setFilledVariant() {
    colorOptions.value = {
        'none': '',
        'primary': ['bg-primary-100 hover:bg-primary-200', 'data-[active=true]:bg-primary-200'],
        'danger': ['bg-danger-300 hover:bg-danger-200', 'data-[active=true]:bg-danger-200'],
        'body-800': ['bg-body-800 hover:bg-body-700', 'data-[active=true]:bg-body-700'],
    }
}

function setTextVariant() {
    colorOptions.value = {
        'none': '',
        'primary': ['hover:bg-primary-300/25', 'data-[active=true]:bg-primary-300/25'],
        'danger': ['hover:bg-danger-300/25', 'data-[active=true]:bg-danger-300/25'],
        'body-800': ['hover:bg-body-700/25', 'data-[active=true]:bg-body-700/25'],
    }
}

function setVariant() {
    if (variant.value === 'text') {
        setTextVariant()
        return
    }

    return setFilledVariant()
}

watch(variant, setVariant, { immediate: true })

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

// disable

const disabled = defineProp<boolean>('disabled', {
    type: Boolean,
    default: false,
})

function setDisabled() {
    set('disabled', disabled.value ? 'opacity-50 pointer-events-none' : '')
}

watch(disabled, setDisabled, { immediate: true })
</script>

<template>
    <component
        :is="to ? RouterLink : 'div'"
        :to="to"
        :class="classes"
        :data-active="isRouteActive || active"
    >
        <slot />
    </component>
</template>
