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

const colorOptions = ref({
    'none': '' as string | string[],
    'primary': '' as string | string[],
    'secondary': '' as string | string[],
    'danger': '' as string | string[],
    'body-700': '' as string | string[],
    'body-900': '' as string | string[],
})

const variant = defineModel('variant', {
    type: String,
    default: 'default',
})

const color = defineModel<keyof typeof colorOptions.value>('color', {
    default: 'primary',
})

const active = defineModel<boolean>('active', {
    type: Boolean,
    default: false,
})

function setDefaultColor() {
    colorOptions.value = {
        'none': '',
        'primary': [
            'bg-primary-300 text-body-0',
            'hover:bg-primary-400 ',
            'data-[active=true]:text-primary-300',
            'data-[loading=true]:text-primary-300/0',
            '[&>*:is(.spinner)]:text-body-0',
        ],
        'secondary': [
            'bg-secondary-300 text-body-0',
            'hover:bg-secondary-400',
            'data-[active=true]:text-secondary-300',
            'data-[loading=true]:text-secondary-300/0',
            '[&>*:is(.spinner)]:text-body-0',
        ],
        'danger': [
            'bg-danger-300 text-body-0',
            'hover:bg-danger-400',
            'data-[active=true]:text-danger-300',
            'data-[loading=true]:text-danger-300/0',
            '[&>*:is(.spinner)]:text-body-0',
        ],
        'body-700': [
            'bg-body-700 text-body-0',
            'hover:bg-body-700',
            'data-[active=true]:text-body-700',
            'data-[loading=true]:text-body-700/0',
            '[&>*:is(.spinner)]:text-body-0',
        ],
        'body-900': [
            'bg-body-900 text-body-0',
            'hover:bg-body-900',
            'data-[active=true]:text-body-900',
            'data-[loading=true]:text-body-900/0',
            '[&>*:is(.spinner)]:text-body-0',
        ],
    }
}

function setOutlinedColor() {
    colorOptions.value = {
        'none': '',
        'primary': [
            'border-2 border-primary-300 text-primary-300',
            'hover:bg-primary-300/25',
            'data-[active=true]:text-primary-300',
            'data-[loading=true]:text-primary-300/0',
            '[&>*:is(.spinner)]:text-primary-300',
        ],
        'secondary': [
            'border-2 border-secondary-300 text-secondary-300',
            'hover:bg-secondary-300/25',
            'data-[active=true]:text-secondary-300',
            'data-[loading=true]:text-secondary-300/0',
            '[&>*:is(.spinner)]:text-secondary-300',
        ],
        'danger': [
            'border-2 border-danger-300 text-danger-300',
            'hover:bg-danger-300/25',
            'data-[active=true]:text-danger-300',
            'data-[loading=true]:text-danger-300/0',
            '[&>*:is(.spinner)]:text-danger-300',
        ],
        'body-700': [
            'border-2 border-body-700 text-body-700',
            'hover:bg-body-700/25',
            'data-[active=true]:text-body-700',
            'data-[loading=true]:text-body-700/0',
            '[&>*:is(.spinner)]:text-body-700',
        ],
        'body-900': [
            'border-2 border-body-900 text-body-900',
            'hover:bg-body-900/25',
            'data-[active=true]:text-body-900',
            'data-[loading=true]:text-body-900/0',
            '[&>*:is(.spinner)]:text-body-900',
        ],
    }
}

function setTextColor() {
    colorOptions.value = {
        'none': '',
        'primary': `
            text-body-0
            hover:text-primary-100
            hover:bg-primary-300/25
            data-[active=true]:text-primary-300
            data-[loading=true]:text-primary-300/0
            [&>*:is(.spinner)]:text-primary-300
        `,
        'secondary': `
            text-body-0
            hover:text-secondary-100
            hover:bg-secondary-300/25
            data-[active=true]:text-secondary-300
            data-[loading=true]:text-secondary-300/0
            [&>*:is(.spinner)]:text-secondary-300
        `,
        'danger': `
            text-body-0
            hover:text-danger-100
            hover:bg-danger-300/25
            data-[active=true]:text-danger-300
            data-[loading=true]:text-danger-300/0
            [&>*:is(.spinner)]:text-danger-300
        `,
        'body-700': `
            text-body-0
            hover:text-body-700
            data-[active=true]:text-body-700
            data-[loading=true]:text-body-700/0
            [&>*:is(.spinner)]:text-body-700
        `,
        'body-900': `
            text-body-0
            hover:text-body-900
            data-[active=true]:text-body-900
            data-[loading=true]:text-body-900/0
            [&>*:is(.spinner)]:text-body-900
        `,
    }
}

function setTonalColor() {
    colorOptions.value = {
        'none': '',
        'primary': [
            'bg-primary-300/25 text-primary-100 hover:bg-primary-300/75 hover:text-body-0',
            'data-[active=true]:text-primary-300',
            'data-[loading=true]:text-primary-300/0',
            '[&>*:is(.spinner)]:text-primary-300',
        ],
        'secondary': [
            'bg-secondary-100 text-secondary-100 hover:bg-secondary-200',
            'data-[active=true]:text-secondary-300',
            'data-[loading=true]:text-secondary-300/0',
            '[&>*:is(.spinner)]:text-secondary-300',
        ],
        'danger': [
            'bg-danger-100 text-danger-100 hover:bg-danger-200',
            'data-[active=true]:text-danger-300',
            'data-[loading=true]:text-danger-300/0',
            '[&>*:is(.spinner)]:text-danger-300',
        ],
        'body-700': [
            'bg-body-700/25 text-body-700 hover:bg-body-700/75',
            'data-[active=true]:text-body-700',
            'data-[loading=true]:text-body-700/0',
            '[&>*:is(.spinner)]:text-body-700',
        ],
        'body-900': [
            'bg-body-900/25 text-body-900 hover:bg-body-900/75',
            'data-[active=true]:text-body-900',
            'data-[loading=true]:text-body-900/0',
            '[&>*:is(.spinner)]:text-body-900',
        ],
    }
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

function setColor() {
    const value = colorOptions.value[color.value]

    set('color', value || '')
}

watch(variant, setVariant, { immediate: true })
watch([color, colorOptions], setColor, { immediate: true })

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
const roundedOptions = {
    sm: 'rounded-sm',
    base: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
}

const rounded = defineModel<keyof typeof roundedOptions>('rounded', {
    default: 'base',
})

function setRounded() {
    const value = roundedOptions[rounded.value]

    set('rounded', value || '')
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
