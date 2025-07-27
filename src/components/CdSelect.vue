<script setup lang="ts">
defineOptions({
    inheritAttrs: false,
})

const props = defineProps({
    label: {
        type: String,
        default: '',
    },
    rules: {
        type: Array as () => ValidationRule[],
        default: () => [],
    },
    options: {
        type: Array as () => any[],
        default: () => [],
    },
    placeholder: {
        type: String,
        default: '',
    },
    valueKey: {
        type: String,
        default: undefined,
    },
    labelKey: {
        type: String,
        default: undefined,
    },
    initialOption: {
        type: [String, Object],
        default: '',
    },
    clearable: {
        type: Boolean,
        default: false,
    },
})

const validation = useValidation(props.rules)
const form = useForm()
const errorMessages = computed(() => {
    return validation.value.messages.map((message) => {
        return {
            type: 'danger',
            message,
        }
    })
})

const menu = ref(false)

const model = defineModel({
    type: [String, Object, Number],
    default: '',
})

const selectedObject = ref<any>(null)

function findLabel(option: any) {
    if (!option) return null

    if (props.labelKey) {
        return option[props.labelKey]
    }

    if (props.valueKey) {
        return option[props.valueKey]
    }

    return option
}

function findValue(option: any) {
    if (!option) return null

    if (props.valueKey) {
        return option[props.valueKey]
    }

    return option
}

function select(option: any) {
    selectedObject.value = option

    model.value = findValue(option)

    menu.value = false
}

function validateModel() {
    const option = selectedObject.value

    return validation.value.validate(option ? option : '')
}

function resetValidation() {
    validation.value.reset()
}

if (form) {
    form.inputs.value.push(validateModel)
    form.resets.value.push(resetValidation)
}

watch(model, validateModel)

onUnmounted(() => {
    if (!form) return

    form.inputs.value.splice(form.inputs.value.indexOf(validateModel), 1)
    form.resets.value.splice(form.resets.value.indexOf(resetValidation), 1)
})

watch(
    () => props.initialOption,
    (v) => {
        if (!v) return

        selectedObject.value = v
    },
    { immediate: true }
)

watch(
    model,
    (v) => {
        const option = props.options.find((o) => findValue(o) === v)

        if (option) {
            selectedObject.value = option
            return
        }

        selectedObject.value = null
    },
    { immediate: true }
)
</script>

<template>
    <cd-menu v-model="menu" :close-on-content-click="false" placement="bottom-start">
        <template #activator="{ attrs }">
            <cd-input
                v-bind="{ ...attrs, ...$attrs }"
                class="w-full"
                :label
                :messages="[...errorMessages]"
                :has-error="errorMessages.length > 0"
            >
                <cd-btn
                    variant="text"
                    color="none"
                    class="py-3 w-full hover:bg-transparent min-h-[44px]"
                >
                    <slot name="selection">
                        <div>
                            {{ findLabel(selectedObject) || placeholder }}
                        </div>
                    </slot>
                    <div class="flex-1" />
                    <cd-icon
                        v-if="clearable && model"
                        name="times"
                        class="mr-4"
                        @click.stop="select(null)"
                    />
                    <cd-icon name="chevron-down" class="text-body-500" />
                </cd-btn>
            </cd-input>
        </template>

        <template #default="{ activatorRects }">
            <cd-card
                class="border-2 border-body-600 rounded w-64 max-w-md max-h-[500px] overflow-y-auto"
                :style="{
                    minWidth: `${activatorRects?.width}px`,
                }"
            >
                <div v-if="!options.length" class="text-body-500 text-center text-sm">
                    {{ $t('noItems') }}
                </div>
                <cd-list-item
                    v-for="(option, index) in options"
                    :key="index"
                    color="primary"
                    class="cursor-pointer"
                    @mousedown="select(option)"
                >
                    <slot name="option" :option="option">
                        {{ findLabel(option) }}
                    </slot>
                </cd-list-item>
            </cd-card>
        </template>
    </cd-menu>
</template>
