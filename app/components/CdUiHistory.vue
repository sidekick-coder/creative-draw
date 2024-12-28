<script setup lang="ts">
const instance = useInstance()

const history = computed(() => instance.tools.history.history)

// prev
const prevMenu = ref(false)
const prevItems = computed(() => instance.tools.history.previousChanges)

function onPrevClick() {
    if (prevMenu.value) {
        return
    }

    instance.tools.history.undo()
}

function onPrevLongPress() {
    prevMenu.value = true
}

// next
const nextMenu = ref(false)
const nextItems = computed(() => instance.tools.history.nextChanges)

function onNextClick() {
    if (nextMenu.value) {
        return
    }

    instance.tools.history.redo()
}

function onNextLongPress() {
    nextMenu.value = true
}
</script>

<template>
    <cd-menu v-model="prevMenu" :open-on-click="false">
        <template #activator="{ attrs }">
            <cd-btn
                v-long-press="onPrevLongPress"
                v-bind="attrs"
                variant="text"
                padding="none"
                size="md"
                :disabled="!prevItems.length"
                @click="onPrevClick"
            >
                <cd-icon name="heroicons:arrow-uturn-left" />
            </cd-btn>
        </template>

        <div class="p-2">
            <cd-card class="max-h-80 w-44 overflow-y-auto">
                <cd-list-item v-if="prevItems.length === 0" color="none"> No history </cd-list-item>
                <cd-list-item
                    v-for="item in prevItems.slice().reverse()"
                    :key="item.id"
                    @click="instance.tools.history.set(item.id)"
                >
                    #{{ history.findIndex((c) => c.id === item.id) }} - {{ item.label }}
                </cd-list-item>
            </cd-card>
        </div>
    </cd-menu>

    <cd-menu v-model="nextMenu" :open-on-click="false">
        <template #activator="{ attrs }">
            <cd-btn
                v-long-press="onNextLongPress"
                v-bind="attrs"
                variant="text"
                padding="none"
                size="md"
                :disabled="!nextItems.length"
                @click="onNextClick"
            >
                <cd-icon name="heroicons:arrow-uturn-right" />
            </cd-btn>
        </template>

        <div class="p-2">
            <cd-card class="max-h-80 w-44 overflow-y-auto">
                <cd-list-item v-if="nextItems.length === 0" color="none"> No history </cd-list-item>
                <cd-list-item
                    v-for="item in nextItems"
                    :key="item.id"
                    @click="instance.tools.history.set(item.id)"
                >
                    #{{ history.findIndex((c) => c.id === item.id) }} - {{ item.label }}
                </cd-list-item>
            </cd-card>
        </div>
    </cd-menu>
</template>
