<script setup lang="ts">
import type Thread from '@/entities/Thread'
import IndexDbThreadRepository from '@/repositories/IndexDBThreadRepository'

// general
const repository = new IndexDbThreadRepository()

// table
const loading = ref(false)
const items = ref<Thread[]>([])
const columns = [
    {
        id: 'id',
        label: 'ID',
        class: 'w-24',
    },
    {
        id: 'title',
        label: 'Title',
        field: 'title',
    },
    {
        id: 'createdAt',
        label: 'Created At',
        field: (item: Thread) => item.createdAt.toLocaleString(),
    },
    {
        id: 'updatedAt',
        label: 'Updated At',
        field: (item: Thread) => item.updatedAt.toLocaleString(),
    },
    {
        id: 'actions',
    },
]

async function load() {
    loading.value = true

    const [error, response] = await tryCatch(() => repository.list())

    if (error) {
        console.error('Failed to load threads:', error)
        loading.value = false
        return
    }

    items.value = response

    setTimeout(() => {
        loading.value = false
    }, 1000)
}

onMounted(load)

// actions
const dialog = ref(false)
const saving = ref(false)
const editedId = ref<string | null>(null)
const payload = ref({
    title: '',
})

async function submit() {
    saving.value = true

    const [error] = await tryCatch(() => {
        if (editedId.value) {
            return repository.update(editedId.value, payload.value)
        }

        return repository.create(payload.value)
    })

    if (error) {
        console.error(error)
        saving.value = false
        return
    }

    setTimeout(() => {
        dialog.value = false
        saving.value = false
        load()
    }, 1000)
}

function editItem(item: Thread) {
    payload.value = { title: item.title }
    editedId.value = item.id
    dialog.value = true
}

async function deleteItem(item: Thread) {
    const [error] = await tryCatch(() => repository.destroy(item.id))

    if (error) {
        console.error('Failed to delete thread:', error)
        return
    }

    await load()
}

watch(dialog, (value) => {
    if (!value) {
        editedId.value = null
        payload.value = { title: '' }
    }
})
</script>
<template>
    <app-layout>
        <div class="p-5 flex flex-col gap-y-5">
            <cd-card>
                <cd-card-head class="flex items-center">
                    <cd-card-title class="flex-1">Threads</cd-card-title>
                    <div class="flex items-center gap-x-2">
                        <cd-btn size="sq-md" :loading="loading" variant="tonal" @click="load">
                            <cd-icon name="mdi:refresh" />
                        </cd-btn>
                        <cd-btn color="primary" @click="dialog = true">
                            {{ $t('Add new') }}
                        </cd-btn>
                    </div>
                </cd-card-head>
            </cd-card>

            <cd-card>
                <cd-data-table :items :columns :total="items.length" :limit="10" :page="1">
                    <template #item-actions="{ item }">
                        <div class="flex gap-x-2 justify-end">
                            <cd-btn
                                color="primary"
                                size="sq-sm"
                                variant="text"
                                @click="editItem(item)"
                            >
                                <cd-icon name="mdi:pencil" />
                            </cd-btn>
                            <cd-btn
                                color="danger"
                                size="sq-sm"
                                variant="text"
                                @click="deleteItem(item)"
                            >
                                <cd-icon name="mdi:delete" />
                            </cd-btn>
                        </div>
                    </template>
                </cd-data-table>
            </cd-card>

            <cd-dialog v-model="dialog">
                <cd-card class="w-96">
                    <cd-card-head>
                        <cd-card-title>
                            {{ editedId ? $t('Edit') : $t('Add new') }}
                        </cd-card-title>
                    </cd-card-head>
                    <cd-card-content>
                        <cd-text-field v-model="payload.title" label="Title" required />
                        <div class="flex justify-end gap-x-2 mt-4">
                            <cd-btn :disabled="saving" color="danger" @click="dialog = false">
                                {{ $t('Cancel') }}
                            </cd-btn>
                            <cd-btn color="primary" :loading="saving" @click="submit">
                                {{ editedId ? $t('Update') : $t('Create') }}
                            </cd-btn>
                        </div>
                    </cd-card-content>
                </cd-card>
            </cd-dialog>
        </div>
    </app-layout>
</template>
