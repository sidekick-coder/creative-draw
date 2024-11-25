<script lang="ts" setup>
import {
    useFloating,
    flip,
    offset,
    type Placement,
    type OffsetOptions,
    shift,
} from '@floating-ui/vue'

import type { ComponentPublicInstance, TransitionProps } from 'vue'
import { onClickOutside } from '@vueuse/core'

// general
const className = defineProp<string>('class', {
    type: String,
    default: null,
})

const classMap = ref(new Map<string, string>())

const classes = computed(() => {
    const all = Array.from(classMap.value.values()).join(' ')

    return twMerge(all, className.value)
})

// activator
const activatorRef = ref<Element | null>(null)
const activatorRects = ref<DOMRect | null>(null)

function setActivatorRects() {
    if (!activatorRef.value) {
        return
    }

    activatorRects.value = activatorRef.value.getBoundingClientRect()
}

watch(activatorRef, setActivatorRects, { immediate: true })

// model
const openOnClick = defineProp<boolean>('openOnClick', {
    type: Boolean,
    default: true,
})

const closeOnContentClick = defineProp<boolean>('closeOnContentClick', {
    type: Boolean,
    default: true,
})

const contentRef = ref<HTMLElement>()

const model = defineModel({
    type: Boolean,
    default: false,
})

function onClick() {
    if (openOnClick.value) {
        model.value = true
    }
}

function onClickContent() {
    if (closeOnContentClick.value) {
        model.value = false
    }
}

onClickOutside(
    contentRef,
    () => {
        model.value = false
    },
    { ignore: [activatorRef as any] }
)

// floating ui definition
const placement = defineProp<Placement>('placement', {
    type: String,
    default: 'bottom',
})

const strategy = defineProp<'fixed' | 'absolute'>('strategy', {
    type: String,
    default: 'fixed',
})

const offsetOptions = defineProp<OffsetOptions>('offset', {
    type: [Number, String, Object],
    default: 0,
})

const middleware = computed(() => [shift(), flip(), offset(offsetOptions.value)])

const { floatingStyles: contentStyles, update } = useFloating(
    activatorRef as any,
    contentRef as any,
    {
        placement: placement as any,
        middleware: middleware as any,
        strategy: strategy as any,
        open: model,
    }
)

function onRef(el: Element | ComponentPublicInstance | null) {
    if (el instanceof Element) {
        activatorRef.value = el
        return
    }

    if (el?.$el) {
        activatorRef.value = el.$el
        return
    }
}

onMounted(() => {
    // fix for when changing layouts
    setTimeout(update, 1000)
})

watch(model, () => {
    if (model.value) {
        update()
    }
})

// transition
const transitionAttrs = defineProp<TransitionProps>('transitionAttrs', {
    type: Object,
    default: () => ({
        enterActiveClass: 'transition ease-out duration-100',
        leaveActiveClass: 'transition ease-in duration-75',
        enterFromClass: 'opacity-0 scale-50',
        leaveToClass: 'opacity-0 scale-50',
    }),
})
</script>

<template>
    <slot
        name="activator"
        :show="model"
        :attrs="{
            ref: onRef,
            onClick: onClick,
        }"
    />

    <div
        ref="contentRef"
        :style="contentStyles"
        class="z-20"
        :class="model ? '' : 'pointer-events-none'"
        @click="onClickContent"
    >
        <transition v-bind="transitionAttrs">
            <div v-visible="model" :class="classes">
                <slot :activator-rects="activatorRects" />
            </div>
        </transition>
    </div>
</template>
