<script setup lang="ts">
import { RouterLink, type RouterLinkProps } from 'vue-router'

// general
const className = defineModel<string>('class', {
    type: String,
    default: null,
})

const { set, classes } = useClassBuilder({ class: className })

set('base', 'cursor-pointer relative flex items-center justify-center ')

// color

const colorOptions: Record<string, string | string[]> = {
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
    ],
    'body-900': [
        `bg-body-900 text-body-0 hover:bg-body-900 `,
        'data-[loading=true]:text-body-900/0 [&>*:is(.spinner)]:text-body-0',
    ],
}

const variant = defineModel<keyof typeof colorOptions>('variant', {
    default: 'default',
})

const color = defineModel<keyof typeof colorOptions>('color', {
    default: 'primary',
})

const active = defineModel<boolean>('active', {
    type: Boolean,
    default: false,
})

function setDefaultColor() {
    const colorValue = colorOptions[color.value]

    set('color', colorValue || '')
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

    set('color', colorValue || '')
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

    set('color', colorValue || '')
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

    set('color', colorValue || '')
}

function setVariant() {
    const options: Record<typeof variant.value, Function> = {
        none: () => set('color', ''),
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

// size
const sizeOptions = {
    'none': '',
    'xs': 'px-2 py-1 text-xs',
    'sm': 'px-4 py-2 text-sm',
    'md': 'px-5 py-2 text-base',
    'lg': 'px-6 py-3 text-lg',
    'sq-xs': 'size-6 text-xs',
    'sq-sm': 'size-8 text-base',
    'sq-md': 'size-10 text-lg',
    'sq-lg': 'size-12 text-xl',
}

const size = defineModel<keyof typeof sizeOptions>('size', {
    default: 'md',
})

function setSize() {
    const option = sizeOptions[size.value]

    set('size', option || '')
}

watch(size, setSize, { immediate: true })

// clickable
const to = defineModel<RouterLinkProps['to']>('to', {
    default: null,
})

// disabled
const disabled = defineModel<boolean>('disabled', {
    type: Boolean,
    default: false,
})

function setDisabled() {
    const disabledValue = disabled.value ? 'opacity-50 cursor-not-allowed' : ''

    set('disabled', disabledValue)
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

    set('rounded', roundedValue || '')
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
