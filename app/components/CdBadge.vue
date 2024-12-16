<script setup lang="ts">
// general

const className = defineProp<string>('class', {
    type: String,
    default: null,
})

const { set, map, classes } = useClassBuilder({ class: className })

set('base', 'inline transition-all rounded-md text-center font-bold')

// color

const variant = defineProp<'default' | 'outlined' | 'tonal'>('variant', {
    type: String,
    default: 'default',
})

const color = defineProp<'primary' | 'success' | 'info' | 'warning' | 'danger' | 'body-100'>(
    'color',
    {
        type: String,
        default: 'primary',
    }
)

function setDefaultVariant() {
    const options: Record<typeof color.value, string> = {
        'primary': 'border border-transparent bg-primary-300 text-body-0',
        'success': 'border border-transparent bg-success-300 text-body-0',
        'info': 'border border-transparent bg-info-300 text-body-0',
        'warning': 'border border-transparent bg-warning-300 text-body-0',
        'danger': 'border border-transparent bg-danger-300 text-body-0',
        'body-100': 'border border-transparent bg-body-100 text-body-0',
    }

    set('color', options[color.value])
}

function setOutlinedVariant() {
    const options: Record<typeof color.value, string> = {
        'primary': 'bg-transparent text-primary-300 border border-primary-300',
        'success': 'bg-transparent text-success-300 border border-success-300',
        'info': 'bg-transparent text-info-300 border border-info-300',
        'warning': 'bg-transparent text-warning-300 border border-warning-300',
        'danger': 'bg-transparent text-danger-300 border border-danger-300',
        'body-100': 'bg-transparent text-body-100 border border-body-100',
    }

    set('color', options[color.value])
}

function setTonalVariant() {
    const options: Record<typeof color.value, string> = {
        'primary': 'bg-primary-300/25 border border-primary-300 text-primary-100',
        'success': 'bg-success-300/25 border border-success-300 text-success-100',
        'info': 'bg-info-300/25 border border-info-300 text-info-100',
        'warning': 'bg-warning-300/25 border border-warning-300 text-warning-100',
        'danger': 'bg-danger-300/25 border border-danger-300 text-danger-100',
        'body-100': 'bg-body-100/25 border border-body-100 text-body-100',
    }

    set('color', options[color.value])
}

function setVariant() {
    const options: Record<typeof variant.value, Function> = {
        default: setDefaultVariant,
        outlined: setOutlinedVariant,
        tonal: setTonalVariant,
    }

    const option = options[variant.value]

    if (option) {
        option()
    }
}

watch([color, variant], setVariant, { immediate: true })

// sizes

const size = defineProp<'sm' | 'md' | 'lg'>('size', {
    type: String,
    default: 'sm',
})

function setSizes() {
    const options: Record<typeof size.value, string> = {
        sm: 'text-xs px-3 py-1',
        md: 'text-sm px-4 py-1',
        lg: 'text-base px-4 py-1',
    }

    set('size', options[size.value])
}

watch(size, setSizes, {
    immediate: true,
})

// others
const tag = defineProp('tag', {
    type: String,
    default: 'div',
})
</script>
<template>
    <component :is="tag" :class="classes">
        <slot />
    </component>
</template>
