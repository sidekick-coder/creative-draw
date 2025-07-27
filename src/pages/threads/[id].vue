<script setup lang="ts">
import type ThreadItem from '@/entities/ThreadItem'
import IndexDbThreadItemRepository from '@/repositories/IndexDBThreadItemRepository'

// general
const repository = new IndexDbThreadItemRepository()
const route = useRoute()

const id = computed(() => route.params.id as string)

// table
const loading = ref(false)
const items = ref<ThreadItem[]>([])
const columns = [
    {
        id: 'id',
        label: 'ID',
        class: 'w-24',
    },
    {
        id: 'type',
        label: __('Type'),
        field: 'type',
    },
    {
        id: 'createdAt',
        label: __('Created At'),
        field: (item: ThreadItem) => item.createdAt.toLocaleString(),
    },
    {
        id: 'updatedAt',
        label: __('Updated At'),
        field: (item: ThreadItem) => item.updatedAt.toLocaleString(),
    },
    {
        id: 'actions',
    },
]

async function load() {
    loading.value = true

    const [error, response] = await tryCatch(() =>
        repository.list({
            filters: {
                threadId: id.value,
            },
        })
    )

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
    type: 'text',
    data: {} as any,
})

async function submit() {
    saving.value = true

    const data = {
        ...payload.value,
        threadId: id.value,
    }

    const [error] = await tryCatch(() => {
        if (editedId.value) {
            return repository.update(editedId.value, data)
        }

        return repository.create(data)
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

function editItem(item: ThreadItem) {
    payload.value = JSON.parse(JSON.stringify(item)) // Deep copy to avoid reference issues
    editedId.value = item.id
    dialog.value = true
}

async function deleteItem(item: ThreadItem) {
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
        payload.value = {
            type: 'text',
            data: {
                content: '',
            },
        }
    }
})
</script>
<template>
    <app-layout>
        <div class="p-5 flex flex-col gap-y-5">
            <cd-card>
                <cd-card-head class="flex items-center">
                    <cd-card-title class="flex-1">Items</cd-card-title>
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
                <cd-form @submit="submit">
                    <cd-card class="w-96">
                        <cd-card-head>
                            <cd-card-title>
                                {{ editedId ? $t('Edit') : $t('Add new') }}
                            </cd-card-title>
                        </cd-card-head>
                        <cd-card-content class="flex flex-col gap-y-4">
                            <cd-select
                                v-if="!editedId"
                                v-model="payload.type"
                                :label="$t('Type')"
                                :rules="[$rules.required()]"
                                :options="[
                                    { label: $t('Text'), value: 'text' },
                                    { label: $t('Image'), value: 'image' },
                                ]"
                                label-key="label"
                                value-key="value"
                            />

                            <cd-textarea
                                v-if="payload.type === 'text'"
                                v-model="payload.data.content"
                                :label="$t('Content')"
                                rows="4"
                            />
                        </cd-card-content>

                        <cd-card-footer>
                            <cd-btn :disabled="saving" color="danger" @click="dialog = false">
                                {{ $t('Cancel') }}
                            </cd-btn>
                            <cd-btn color="primary" :loading="saving" type="submit">
                                {{ editedId ? $t('Update') : $t('Create') }}
                            </cd-btn>
                        </cd-card-footer>
                    </cd-card>
                </cd-form>
            </cd-dialog>
        </div>
    </app-layout>
</template>
