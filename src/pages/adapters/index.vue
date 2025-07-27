<script setup lang="ts">
import type Adapter from '@/entities/Adapter'
import IndexDBAdapterRepository from '@/repositories/IndexDBAdapterRepository'

// general
const repository = new IndexDBAdapterRepository()

// table
const loading = ref(false)
const items = ref<Adapter[]>([])
const columns = [
    {
        id: 'id',
        label: 'ID',
        class: 'w-24',
    },
    {
        id: 'name',
        label: __('Name'),
        field: 'name',
    },
    {
        id: 'description',
        label: __('Description'),
        field: 'description',
    },
    {
        id: 'createdAt',
        label: __('Created At'),
        field: (item: Adapter) => $date.dateTime(item.createdAt),
    },
    {
        id: 'updatedAt',
        label: __('Updated At'),
        field: (item: Adapter) => $date.dateTime(item.updatedAt),
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
    name: '',
    type: 'openai',
    description: '',
    config: {} as any,
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
    payload.value = JSON.parse(JSON.stringify(item))
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
        payload.value = {
            name: '',
            type: 'openai',
            description: '',
            config: {},
        }
    }
})
</script>
<template>
    <app-layout>
        <div class="p-5 flex flex-col gap-y-5">
            <cd-card>
                <cd-card-head class="flex items-center">
                    <cd-card-title class="flex-1">
                        {{ $t('Adapters') }}
                    </cd-card-title>
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
                        <div class="flex justify-end">
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
                            <cd-text-field v-model="payload.type" :label="$t('Type')" disabled />

                            <cd-text-field
                                v-model="payload.name"
                                :label="$t('Name')"
                                :rules="[$rules.required()]"
                            />
                            <cd-text-field
                                v-model="payload.description"
                                :label="$t('Description')"
                            />

                            <template v-if="payload.type === 'openai'">
                                <cd-text-field
                                    v-model="payload.config.apiKey"
                                    :label="$t('API Key')"
                                    :rules="[$rules.required()]"
                                />
                            </template>
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
