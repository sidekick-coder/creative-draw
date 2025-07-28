<script lang="ts" setup>
import merge from 'lodash/merge'
import { Mask, type MaskOptions } from 'maska'

// general

const props = defineProps({
    label: {
        type: String,
        default: '',
    },
    rules: {
        type: Array as () => ValidationRule[],
        default: () => [],
    },
    placeholder: {
        type: String,
        default: '',
    },
    clearable: {
        type: Boolean,
        default: false,
    },
})

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

// mask
const mask = defineProp<string>('mask', {
    type: String,
    default: null,
})

const maskOptions = defineProp<MaskOptions>('maskOptions', {
    type: Object,
    default: null,
})

const defaultMaskOptions: MaskOptions = {
    tokens: {
        '#': { pattern: /[0-9]/ }, // digits
        '@': { pattern: /[a-zA-Z]/ }, // letters
        '*': { pattern: /[a-zA-Z0-9]/ }, // letters & digits
        0: { pattern: /[0-9]/, optional: true },
        9: { pattern: /[0-9]/, repeated: true },
    },
}

const maskInstance = computed(() => {
    if (!mask.value) return null

    return new Mask(
        merge(defaultMaskOptions, maskOptions.value, {
            mask: mask.value,
        })
    )
})

// model
const [model, modifiers] = defineModel<string | number, 'lazy' | 'number' | 'masked'>({
    type: [String, Number],
    default: null,
    get: (value) => {
        if (!maskInstance.value) {
            return value
        }

        return maskInstance.value.masked(String(value))
    },
    set: (value) => {
        if (!maskInstance.value) {
            return value
        }

        const unmasked = maskInstance.value.unmasked(String(value))

        if (modifiers.number) {
            return Number(unmasked)
        }

        if (modifiers.masked) {
            return maskInstance.value.masked(unmasked)
        }

        return unmasked
    },
})

function onInput(event: Event) {
    if (modifiers.lazy) return

    const target = event.target as HTMLInputElement

    model.value = target.value

    if (target.value !== model.value) {
        target.value = model.value
    }
}

function onChange(event: Event) {
    if (!modifiers.lazy) return

    const target = event.target as HTMLInputElement

    model.value = target.value
}

// validation
const inputRef = ref<HTMLInputElement | null>(null)
const form = useForm()
const validation = useValidation(props.rules)
const errorMessages = computed(() => {
    return validation.value.messages.map((message) => {
        return {
            type: 'danger',
            message,
        }
    })
})

function validateModel() {
    return validation.value.validate(model.value)
}

function resetValidation() {
    validation.value.reset()
}

function focus() {
    if (inputRef.value) {
        inputRef.value.focus()
    }
}

watch(model, validateModel)

if (form) {
    form.inputs.value.push(validateModel)
    form.resets.value.push(resetValidation)
}

onUnmounted(() => {
    if (!form) {
        return
    }

    form.inputs.value.splice(form.inputs.value.indexOf(validateModel), 1)

    form.resets.value.splice(form.resets.value.indexOf(resetValidation), 1)
})

defineExpose({
    focus,
})

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
    <cd-input v-bind="$props" :messages="[...errorMessages]" :has-error="errorMessages.length > 0">
        <template v-if="$slots.prepend" #prepend>
            <slot name="prepend" />
        </template>

        <template #default="{ id }">
            <input
                :id="id"
                ref="inputRef"
                :class="classes"
                :value="model"
                :disabled="disabled"
                :readonly="readonly"
                :placeholder="placeholder"
                v-bind="$attrs"
                @input="onInput"
                @change="onChange"
            />
        </template>
    </cd-input>
</template>
