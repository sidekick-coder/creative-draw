<script setup lang="ts">
import { RouterLink } from 'vue-router'

// general
const className = defineModel<string>('class', {
    type: String,
    default: null,
})

const classMap = ref(new Map<string, string>())

classMap.value.set(
    'base',
    'relative transition-colors duration-300 cursor-pointer flex items-center justify-center'
)

const classes = computed(() => {
    const all = Array.from(classMap.value.values()).join(' ')

    return twMerge(all, className.value)
})

// color
const variant = defineModel<'default' | 'none' | 'outlined' | 'text' | 'tonal'>('variant', {
    default: 'default',
})

const color = defineModel<'none' | 'primary' | 'secondary' | 'danger' | 'body-700'>('color', {
    default: 'primary',
})

const active = defineModel<boolean>('active', {
    type: Boolean,
    default: false,
})

function setDefaultColor() {
    const options: Record<typeof color.value, string> = {
        'none': '',
        'primary': `
            bg-primary-300 text-body-0
            hover:bg-primary-400 
            data-[active=true]:text-primary-300
        `,
        'secondary': `bg-secondary-300 text-body-0 hover:bg-secondary-400`,
        'danger': `bg-danger-300 text-body-0 hover:bg-danger-400`,
        'body-700': [
            `bg-body-700 text-body-0 hover:bg-body-700 `,
            'data-[loading=true]:text-body-700/0 [&>*:is(.spinner)]:text-body-0',
        ].join(' '),
    }

    const colorValue = options[color.value]

    classMap.value.set('color', colorValue || '')
}

function setOutlinedColor() {
    const options: Record<typeof color.value, string> = {
        'none': 'border border-transparent',
        'primary': 'border border-primary-100 text-primary-100 hover:bg-primary-500',
        'secondary': 'border border-secondary-100 text-secondary-100 hover:bg-secondary-500',
        'danger': 'border border-danger-100 text-danger-100 hover:bg-danger-500',
        'body-700': 'border border-body-700 text-body-700 hover:bg-body-700',
    }

    const colorValue = options[color.value]

    classMap.value.set('color', colorValue || '')
}

function setTextColor() {
    const options: Record<typeof color.value, string> = {
        'none': '',
        'primary': `
            text-body-0
            hover:text-primary-100
            hover:bg-primary-300/25
            data-[active=true]:text-primary-300
        `,
        'secondary': 'text-body-0 hover:text-secondary-300',
        'danger': 'text-body-0 hover:text-danger-300',
        'body-700': 'text-body-0 hover:text-body-700',
    }

    const colorValue = options[color.value]

    classMap.value.set('color', colorValue || '')
}

function setTonalColor() {
    const options: Record<typeof color.value, string> = {
        'none': '',
        'primary': 'bg-primary-300/25 text-primary-100 hover:bg-primary-300/75 hover:text-body-0',
        'secondary': 'bg-secondary-100 text-secondary-100 hover:bg-secondary-200',
        'danger': 'bg-danger-100 text-danger-100 hover:bg-danger-200',
        'body-700': 'bg-body-700/25 text-body-700 hover:bg-body-700/75',
    }

    const colorValue = options[color.value]

    classMap.value.set('color', colorValue || '')
}

function setVariant() {
    const options: Record<typeof variant.value, Function> = {
        none: () => classMap.value.set('color', ''),
        default: setDefaultColor,
        outlined: setOutlinedColor,
        text: setTextColor,
        tonal: setTonalColor,
    }

    const option = options[variant.value]

    if (option) {
        option()
    }
}

watch([color, variant], setVariant, { immediate: true })

// padding
const padding = defineModel<'none' | 'xs' | 'sm' | 'md' | 'lg'>('padding', {
    type: String,
    default: 'md',
})

function setPadding() {
    const options: Record<typeof padding.value, string> = {
        none: '',
        xs: 'px-2 py-1 text-xs',
        sm: 'px-4 py-1 text-xs',
        md: 'px-5 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    }

    const option = options[padding.value]

    classMap.value.set('padding', option || '')
}

watch(padding, setPadding, { immediate: true })

// size
const size = defineModel<'none' | 'xs' | 'sm' | 'md' | 'lg'>('size', {
    type: String,
    default: 'none',
})

function setSize() {
    const options: Record<typeof size.value, string> = {
        none: '',
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-base',
        md: 'w-10 h-10 text-lg',
        lg: 'w-12 h-12 text-xl',
    }

    const option = options[size.value]

    classMap.value.set('size', option || '')
}

watch(size, setSize, { immediate: true })

// clickable
const to = defineModel<NuxtLinkProps['to']>('to', {
    type: [String, Object],
    default: null,
})

// disabled
const disabled = defineModel<boolean>('disabled', {
    type: Boolean,
    default: false,
})

function setDisabled() {
    const disabledValue = disabled.value ? 'opacity-50 cursor-not-allowed' : ''

    classMap.value.set('disabled', disabledValue)
}

watch(disabled, setDisabled, { immediate: true })

// rounded
const rounded = defineModel<'sm' | 'base' | 'md' | 'lg' | 'full'>('rounded', {
    type: String,
    default: 'base',
})

function setRounded() {
    const options: Record<typeof rounded.value, string> = {
        sm: 'rounded-sm',
        base: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    }

    const roundedValue = options[rounded.value]

    classMap.value.set('rounded', roundedValue || '')
}

watch(rounded, setRounded, { immediate: true })

// others

const loading = defineModel<boolean>('loading', {
    type: Boolean,
    default: false,
})

const type = defineModel<string>('type', {
    type: String,
    default: 'button',
})
</script>

<template>
    <component
        :is="to ? RouterLink : 'button'"
        :type="type"
        :class="classes"
        :to="to"
        :data-active="active"
        :data-loading="loading"
    >
        <div v-if="loading" class="absolute inset-0 spinner flex items-center justify-center">
            <cd-spinner size="22" />
        </div>

        <slot />
    </component>
</template>
