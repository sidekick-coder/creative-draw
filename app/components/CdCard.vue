<script setup lang="ts">
import { NuxtLink } from '#components'
import type { NuxtLinkProps } from 'nuxt/app'

// general
const className = defineProp<string>('class', {
    type: String,
    default: null,
})

const { set, classes } = useClassBuilder({ class: className })

set('base', [
    'rounded',
    'overflow-hidden',
    'transition-colors duration-200',
    '[&>*:is(.card-content,.card-head)]:px-4',
    '[&>*:is(.card-content,.card-head):first-child]:pt-4',
    '[&>*:is(.card-content,.card-head)]:pb-4',
])

// color
const color = defineProp<'none' | 'default' | 'body-600' | 'body-800'>('color', {
    type: String,
    default: 'default',
})

function setColor() {
    const options: Record<typeof color.value, string> = {
        'none': '',
        'default': 'bg-body-900',
        'body-600': 'bg-body-600 [&.clickable]:hover:bg-body-500',
        'body-800': 'bg-body-800',
    }

    const colorClass = options[color.value]

    set('color', colorClass)
}

watch(color, setColor, { immediate: true })

// link
const to = defineProp<NuxtLinkProps['to']>('to', {
    type: [String, Object],
    default: null,
})

function setClickable() {
    let isClickable = !!to.value

    set('clickable', isClickable ? 'clickable cursor-pointer' : '')
}

watch(to, setClickable, { immediate: true })
</script>

<template>
    <component :is="to ? NuxtLink : 'div'" :class="classes" :to="to">
        <slot />
    </component>
</template>
