<script setup lang="ts">
const layer = defineProp<Layer>('layer', {
    type: Object,
    required: true,
})

const emit = defineEmits<{
    (e: 'update:layer', layer: Layer): void
    (e: 'move-up', layer: Layer): void
    (e: 'move-down', layer: Layer): void
}>()

// menu
const menu = ref(false)
</script>
<template>
    <cd-list-item class="flex border-b border-body-600 p-0" color="none" @dblclick="menu = true">
        <!-- <cd-ui-layer-list-item-preview :model-value="layer" /> -->

        <div class="flex-1 text-sm text-body-0">
            <input
                v-model.lazy="layer.name"
                class="h-12 w-full bg-transparent px-4 focus:outline-none"
                autofocus
                placeholder="Layer name"
            />
        </div>

        <div class="flex items-center">
            <cd-btn size="sq-md" variant="text" @click="layer.visible = !layer.visible">
                <cd-icon v-show="layer.visible" name="heroicons:eye-16-solid" />
                <cd-icon v-show="!layer.visible" name="heroicons:eye-slash-16-solid" />
            </cd-btn>

            <cd-btn size="sq-md" variant="text" @click="emit('move-up', layer)">
                <cd-icon name="heroicons:chevron-up-20-solid" />
            </cd-btn>

            <cd-btn size="sq-md" variant="text" @click="emit('move-down', layer)">
                <cd-icon name="heroicons:chevron-down-20-solid" />
            </cd-btn>
            <cd-menu :close-on-content-click="false">
                <template #activator="{ attrs }">
                    <cd-btn v-bind="attrs" size="sq-md" color="body-900">
                        <cd-icon name="heroicons:ellipsis-vertical" />
                    </cd-btn>
                </template>
                <div class="py-2 px-4">
                    <cd-card class="border-2 border-body-600 w-96">
                        <cd-list-item class="border-b border-body-600">
                            <cd-text-field v-model.lazy="layer.name" placeholder="Name" />
                        </cd-list-item>
                        <cd-list-item>
                            <cd-input-label for="layer-opacity">Opacity</cd-input-label>
                            <cd-range
                                id="layer-opacity"
                                v-model.number="layer.opacity"
                                min="0"
                                max="1"
                                step="0.01"
                                class="flex-1 bg-body-600"
                            />
                        </cd-list-item>

                        <cd-list-item class="gap-x-0">
                            <cd-input-label for="layer-background-color" class="flex-1">
                                Background Color
                            </cd-input-label>
                            <cd-btn
                                size="sq-md"
                                :variant="!layer.backgroundColor ? 'tonal' : 'text'"
                                class="flex items-center justify-center"
                                @click="layer.backgroundColor = null"
                            >
                                <cd-icon name="mdi:image-off" />
                            </cd-btn>

                            <cd-color-picker
                                id="layer-background-color"
                                v-model="layer.backgroundColor"
                            />
                        </cd-list-item>
                        <cd-list-item color="primary">
                            <cd-icon name="heroicons:trash-16-solid" />
                            <span>Delete</span>
                        </cd-list-item>
                    </cd-card>
                </div>
            </cd-menu>
        </div>
    </cd-list-item>
</template>
