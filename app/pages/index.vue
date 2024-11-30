<script setup lang="ts">
definePageMeta({
    tile: 'Creative draw',
})

const items = ref<Handle[]>([])

async function setItems() {
    items.value = await $db.handles.toArray()
}

async function deleteItem(item: Handle) {
    await $db.handles.delete(item.id)

    setItems()
}

onMounted(setItems)

async function open() {
    const handle = await showDirectoryPicker({
        mode: 'readwrite',
    })

    const exists = await $db.handles.where('name').equals(handle.name).first()

    if (exists) {
        await $db.handles.delete(exists.id)
        return
    }

    const id = await $db.handles.add({
        name: handle.name,
        handle,
    })

    navigateTo(`/projects/${id}`)
}
</script>

<template>
    <div class="w-dvh flex h-dvh">
        <div class="flex h-full w-10/12 items-center justify-center">
            <div class="flex w-full max-w-sm flex-col justify-center text-center">
                <h1 class="mb-4 text-2xl font-bold">Creative draw</h1>
                <div class="mb-8 flex flex-col gap-y-2">
                    <cd-btn to="/projects">{{ $t('newEntity', [$t('project')]) }}</cd-btn>
                    <cd-btn @click="open">{{ $t('openEntity', [$t('project')]) }}</cd-btn>
                </div>

                <div v-if="items.length" class="flex flex-col gap-y-2 py-4">
                    <h2 class="text-left text-lg font-bold text-body-100">
                        {{ $t('recentOpened') }}
                    </h2>

                    <cd-card v-for="item in items" :key="item.id" :to="`/projects/${item.id}`">
                        <cd-card-content class="flex items-center">
                            <cd-icon name="heroicons:document-20-solid" class="text-xl" />

                            <div class="flex-1 pl-4 text-left">{{ item.name }}</div>

                            <div class="flex gap-x-2">
                                <cd-btn
                                    color="body-700"
                                    padding="none"
                                    size="sm"
                                    @click="navigateTo(`/projects/${item.id}`)"
                                >
                                    <cd-icon name="heroicons:chevron-right-20-solid" />
                                </cd-btn>

                                <cd-btn
                                    color="body-700"
                                    padding="none"
                                    size="sm"
                                    @click.stop="deleteItem(item)"
                                >
                                    <cd-icon name="heroicons:trash-20-solid" />
                                </cd-btn>
                            </div>
                        </cd-card-content>
                    </cd-card>
                </div>
            </div>
        </div>
        <div class="flex w-2/12 flex-col gap-y-8 bg-body-700 p-4">
            <div v-for="i in 3" :key="i">
                <cd-card class="h-32">ads </cd-card>
            </div>
        </div>
    </div>
</template>
