<script setup lang="ts">
import { refDebounced, syncRef, watchDebounced } from '@vueuse/core'

defineOptions({
    inheritAttrs: false,
})

defineProps({
    id: {
        type: String,
        default: null,
    },
    label: {
        type: String,
        default: null,
    },
})

const model = defineModel<ColorRGB>({
    type: Object,
    default: { red: 0, green: 0, blue: 0 },
})

const innerModel = ref({
    ...model.value,
})

watchDebounced(
    innerModel,
    () => {
        model.value = { ...innerModel.value }
    },
    { debounce: 500, deep: true }
)
</script>
<template>
    <cd-menu :close-on-content-click="false" :offset="{ mainAxis: 16, crossAxis: -16 }">
        <template #activator="{ attrs }">
            <cd-input-label
                v-if="label"
                v-bind="attrs"
                :for="id"
                class="flex items-center gap-x-2 w-full"
            >
                <div class="flex-1">
                    {{ label }}
                </div>

                <cd-btn :id size="sq-md" color="body-900" class="flex items-center justify-center">
                    <div
                        class="size-6 rounded-full border-2 border-body-500"
                        :style="{
                            backgroundColor: `rgb(${model?.r}, ${model?.g}, ${model?.b})`,
                        }"
                    ></div>
                </cd-btn>
            </cd-input-label>
            <cd-btn
                v-else
                :id
                size="sq-md"
                v-bind="attrs"
                color="body-900"
                class="flex items-center justify-center"
            >
                <div
                    class="size-6 rounded-full border-2 border-body-500"
                    :style="{
                        backgroundColor: `rgb(${model?.r}, ${model?.g}, ${model?.b})`,
                    }"
                ></div>
            </cd-btn>
        </template>

        <cd-color-picker-card v-model="innerModel" />
    </cd-menu>
</template>
