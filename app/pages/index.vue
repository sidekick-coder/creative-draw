<script setup lang="ts">
definePageMeta({
    tile: 'Creative draw',
})

const items = ref<Handle[]>([])

async function setItems() {
    items.value = await $db.handles.toArray()
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
                <div class="flex flex-col gap-y-2">
                    <cd-btn to="/projects">{{ $t('newEntity', [$t('project')]) }}</cd-btn>
                    <cd-btn @click="open">{{ $t('openEntity', [$t('project')]) }}</cd-btn>
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
