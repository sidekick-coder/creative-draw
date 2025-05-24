<script setup lang="ts">
const layer = defineProp<ProjectDataLayer>('layer', {
    type: Object,
    required: true,
})

const active = defineProp<boolean>('active', {
    type: Boolean,
    default: false,
})

const emitUpdate = defineEmit<(d: Partial<ProjectDataLayer>) => any>('update')
const emitSelect = defineEmit('select')
const emitRemove = defineEmit('remove')
const emitMoveUp = defineEmit('move-up')
const emitMoveDown = defineEmit('move-down')
// menu
const menu = ref(false)

function onClick() {
    emitSelect()
}

// edit
const edit = ref(false)
const inputRef = ref<HTMLInputElement>()

const opacity = computed({
    get: () => Math.ceil(!isNaN(layer.value.opacity) ? layer.value.opacity * 100 : 100),
    set: (value) => {
        emitUpdate({
            ...layer.value,
            opacity: value / 100,
        })
    },
})

function blur() {
    inputRef.value?.blur()
}

function onChangeName(event: Event) {
    const input = event.target as HTMLInputElement

    emitUpdate({
        ...layer.value,
        name: input.value,
    })
}

function toggleVisible() {
    emitUpdate({
        ...layer.value,
        visible: !layer.value.visible,
    })
}
</script>
<template>
    <cd-menu v-model="menu" :open-on-click="false" :close-on-content-click="false">
        <template #activator="{ attrs }">
            <cd-list-item
                v-bind="attrs"
                class="group flex"
                :active
                @click="onClick"
                @dblclick="menu = true"
            >
                <cd-ui-layer-list-item-preview :model-value="layer" />

                <div class="flex-1 text-sm text-body-0" @dblclick.prevent.stop="edit = true">
                    <input
                        ref="inputRef"
                        :value="layer.name"
                        class="h-10 w-full bg-body-600 px-4 focus:outline-none"
                        :class="edit ? 'bg-body-600' : 'bg-transparent cursor-pointer'"
                        autofocus
                        :readonly="!edit"
                        @change="onChangeName"
                        @blur="edit = false"
                        @keydown.enter="blur"
                        @keydown.esc="blur"
                    />
                </div>

                <div class="flex">
                    <cd-btn
                        variant="text"
                        padding="none"
                        color="none"
                        class="text-body-100 hover:text-body-50"
                        size="sm"
                        @click.stop="emitMoveUp"
                    >
                        <cd-icon name="heroicons:chevron-up-20-solid" />
                    </cd-btn>

                    <cd-btn
                        variant="text"
                        padding="none"
                        color="none"
                        class="text-body-100 hover:text-body-50"
                        size="sm"
                        @click.stop="emitMoveDown"
                    >
                        <cd-icon name="heroicons:chevron-down-20-solid" />
                    </cd-btn>

                    <cd-btn
                        variant="text"
                        padding="none"
                        color="none"
                        class="text-body-100 hover:text-body-50"
                        size="sm"
                        @click.stop="toggleVisible"
                    >
                        <cd-icon v-if="layer.visible" name="heroicons:eye-20-solid" />
                        <cd-icon v-else name="heroicons:eye-slash-20-solid" />
                    </cd-btn>

                    <cd-btn
                        variant="text"
                        padding="none"
                        size="sm"
                        color="none"
                        class="text-body-100 hover:text-body-50"
                        @click="emitRemove"
                    >
                        <cd-icon name="heroicons:trash-20-solid" />
                    </cd-btn>
                </div>
            </cd-list-item>
        </template>

        <cd-card class="w-72 bg-body-800" draggable="true" @dragstart.prevent.stop>
            <cd-card-head>
                <cd-card-title class="mr-auto text-base">Layer settigs</cd-card-title>
            </cd-card-head>

            <cd-card-content class="flex flex-col gap-y-4">
                <cd-text-field v.model.lazy="layer.name" label="Name" />
                <cd-input :label="`Opacity (${opacity}%)`" input-container-class="py-2 border-0">
                    <cd-range v-model="opacity" max="100" min="0" class="w-full bg-body-500" />
                </cd-input>
            </cd-card-content>
        </cd-card>
    </cd-menu>
</template>
