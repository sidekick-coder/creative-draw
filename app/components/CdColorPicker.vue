<script setup lang="ts">
const model = defineModel({
    type: Object as PropType<ColorRGB>,
    default: { red: 0, green: 0, blue: 0 },
})

const mainColor = ref<ColorRGB>({
    r: 255,
    g: 0,
    b: 0,
})

const hue = computed({
    get: () => {
        const { h } = rgbToHsl(model.value.r, model.value.g, model.value.b)

        return h
    },
    set: (value) => {
        const { r, g, b } = hslToRgb(value, 1, 0.5)

        model.value = { r, g, b }
    },
})

const hsl = computed({
    get: () => {
        const { h, s, l } = rgbToHsl(model.value.r, model.value.g, model.value.b)

        return {
            h: Math.round(h * 100),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
        }
    },
    set: (value) => {
        const h = value.h / 100
        const s = value.s / 100
        const l = value.l / 100

        model.value = hslToRgb(h, s, l)
    },
})
</script>
<template>
    <cd-card class="w-96 bg-body-900">
        <cd-card-head>
            <cd-card-title class="mr-auto text-base">Color</cd-card-title>
        </cd-card-head>

        <cd-card-content class="flex flex-col gap-y-4">
            <div class="flex justify-between gap-x-5">
                <cd-color-picker-wheel v-model="model" class="w-full" :main-color="mainColor" />
                <cd-color-picker-slider v-model="hue" class="w-4" />
            </div>

            <div class="-mx-2 flex [&>*]:px-2">
                <div class="w-4/12">
                    <cd-text-field v-model="model.r" type="number" min="0" max="255" />
                </div>

                <div class="w-4/12">
                    <cd-text-field v-model="model.g" type="number" min="0" max="255" />
                </div>

                <div class="w-4/12">
                    <cd-text-field v-model="model.b" type="number" min="0" max="255" />
                </div>
            </div>

            <div class="-mx-2 flex [&>*]:px-2">
                <div class="w-4/12">
                    <cd-text-field
                        :model-value="hsl.h"
                        type="number"
                        min="0"
                        max="100"
                        @update:model-value="hsl = { ...hsl, h: $event }"
                    />
                </div>

                <div class="w-4/12">
                    <cd-text-field
                        :model-value="hsl.s"
                        type="number"
                        min="0"
                        max="100"
                        @update:model-value="hsl = { ...hsl, s: $event }"
                    />
                </div>

                <div class="w-4/12">
                    <cd-text-field
                        :model-value="hsl.l"
                        type="number"
                        min="0"
                        max="100"
                        @update:model-value="hsl = { ...hsl, l: $event }"
                    />
                </div>
            </div>
        </cd-card-content>
    </cd-card>
</template>
