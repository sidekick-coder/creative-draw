<script setup lang="ts">
const model = defineModel({
    type: Object as PropType<ColorRGB | null>,
    default: { red: 0, green: 0, blue: 0 },
})

const mainColor = ref<ColorRGB>({
    r: 255,
    g: 0,
    b: 0,
})

const hue = computed({
    get: () => {
        const { h } = rgbToHsl(model.value?.r || 0, model.value?.g || 0, model.value?.b || 0)

        return h
    },
    set: (value) => {
        const { r, g, b } = hslToRgb(value, 1, 0.5)

        model.value = { r, g, b }
    },
})

const rgbString = computed({
    get: () => {
        return `${model.value?.r || 0} ${model.value?.g || 0} ${model.value?.b || 0}`
    },
    set: (value) => {
        const args = value
            .replace('rgb(', '')
            .replace(')', '')
            // slit by comma or space
            .split(/,| /)
            .filter((v) => v !== '')

        const [r, g, b] = args.map((v) => Number(v)) as [number, number, number]

        if ([r, g, b].some((v) => isNaN(v))) {
            return
        }

        model.value = { r, g, b }
    },
})

const hslString = computed({
    get: () => {
        const { h, s, l } = rgbToHsl(model.value?.r || 0, model.value?.g || 0, model.value?.b || 0)

        return `${Math.round(h * 360)}° ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
    },
    set: (value) => {
        const args = value
            .replace('hsl(', '')
            .replace(')', '')
            .replaceAll('%', '')
            .replace('°', '')
            // slit by comma or space
            .split(/,| /)
            .filter((v) => v !== '')

        let [h, s, l] = args.map((v) => Number(v)) as [number, number, number]

        if ([h, s, l].some((v) => isNaN(v))) {
            return
        }

        h = Math.min(360, Math.max(0, h))
        s = Math.min(100, Math.max(0, s))
        l = Math.min(100, Math.max(0, l))

        model.value = hslToRgb(h / 360, s / 100, l / 100)
    },
})
</script>
<template>
    <cd-card class="w-96 bg-body-900 border-2 border-body-600">
        <cd-card-content class="flex flex-col gap-y-4">
            <div class="flex justify-between gap-x-5 mb-4">
                <cd-color-picker-wheel v-model="model" class="w-full" :main-color="mainColor" />
                <cd-color-picker-slider v-model="hue" class="w-4" />
            </div>

            <cd-text-field v-model.lazy="rgbString">
                <template #prepend>
                    <cd-input-label>RGB</cd-input-label>
                </template>
            </cd-text-field>

            <cd-text-field v-model.lazy="hslString">
                <template #prepend>
                    <cd-input-label>HSL</cd-input-label>
                </template>
            </cd-text-field>
        </cd-card-content>
    </cd-card>
</template>
