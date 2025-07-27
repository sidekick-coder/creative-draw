<script lang="ts" setup>
// general
const className = defineProp<string>('class', {
    type: String,
    default: null,
})

const { classes, set } = useClassBuilder(className)

set('base', [
    'w-full',
    'flex-1',
    'px-4',
    'py-2',
    'bg-transparent',
    'outline-none',
    'placeholder:text-body-300',
])
// model
const inputRef = ref<HTMLInputElement | null>(null)

const [model, modifiers] = defineModel<string | number, 'lazy'>({
    type: [String, Number],
    default: null,
})

function onInput(event: Event) {
    if (modifiers.lazy) return

    const target = event.target as HTMLInputElement

    model.value = target.value
}

function onChange(event: Event) {
    if (!modifiers.lazy) return

    const target = event.target as HTMLInputElement

    model.value = target.value
}

// others
const disabled = defineProp<boolean>('disabled', {
    type: Boolean,
    default: false,
})

const readonly = defineProp<boolean>('readonly', {
    type: Boolean,
    default: false,
})
</script>

<template>
    <cd-input v-bind="$props">
        <template v-if="$slots.prepend" #prepend>
            <slot name="prepend" />
        </template>

        <template #default="{ id }">
            <textarea
                :id="id"
                ref="inputRef"
                :class="classes"
                :value="model"
                :disabled="disabled"
                :readonly="readonly"
                v-bind="$attrs"
                @input="onInput"
                @change="onChange"
            />
        </template>
    </cd-input>
</template>
