<script setup lang="ts">
import File from '@/entities/File'
import IndexDbDriveGateway from '@/gateways/IndexDbDriveGateway'
import { $file } from '@/utils/file'

// table
const drive = new IndexDbDriveGateway()
const loading = ref(false)
const items = ref<File[]>([])
const columns = [
    {
        id: 'preview',
        label: '',
        class: 'w-24',
    },
    {
        id: 'filename',
        label: __('Filename'),
        field: 'filename',
    },
    {
        id: 'mimetype',
        label: __('Mimetype'),
        field: 'mimetype',
    },
    {
        id: 'createdAt',
        label: __('Created At'),
        field: (item: File) => $date.dateTime(item.createdAt),
    },
    {
        id: 'updatedAt',
        label: __('Updated At'),
        field: (item: File) => $date.dateTime(item.updatedAt),
    },
    {
        id: 'actions',
    },
]

async function load() {
    loading.value = true

    const [error, response] = await tryCatch(() => drive.list())

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
const saving = ref(false)

async function destroy(item: File) {
    const [error] = await tryCatch(() => drive.destroy(item.filename))

    if (error) {
        console.error('Failed to delete file:', error)
        return
    }

    await load()
}

async function upload() {
    const file = await $file.pick({
        multiple: false,
    })

    if (!file) {
        return
    }

    saving.value = true

    const filename = `${createId()}.${File.extension(file.name)}`
    const contents = await $file.toUint8Array(file)

    const [error] = await tryCatch(() => drive.write(filename, contents))

    if (error) {
        console.error('Failed to upload file:', error)
        saving.value = false
        return
    }

    setTimeout(() => {
        saving.value = false
        load()
    }, 1000)
}
</script>
<template>
    <app-layout>
        <div class="p-5 flex flex-col gap-y-5">
            <cd-card>
                <cd-card-head class="flex items-center">
                    <cd-card-title class="flex-1">
                        {{ $t('Files') }}
                    </cd-card-title>
                    <div class="flex items-center gap-x-2">
                        <cd-btn size="sq-md" variant="tonal" @click="load">
                            <cd-icon name="mdi:refresh" />
                        </cd-btn>
                        <cd-btn color="primary" :loading="saving" @click="upload">
                            {{ $t('Add new') }}
                        </cd-btn>
                    </div>
                </cd-card-head>
            </cd-card>

            <cd-card>
                <cd-data-table :items :columns :total="items.length" :limit="10" :page="1" :loading>
                    <template #item-preview="{ item }">
                        <div class="size-24 flex items-center justify-center bg-body-800 rounded">
                            <cd-img
                                v-if="item.mimetype.includes('image')"
                                :src="`drive:${item.filename}`"
                                :alt="item.filename"
                            />
                            <cd-icon
                                v-else
                                :name="File.icon(item.filename)"
                                class="text-body-100 size-10"
                            />
                        </div>
                    </template>
                    <template #item-actions="{ item }">
                        <div class="flex justify-end">
                            <cd-btn
                                color="danger"
                                size="sq-sm"
                                variant="text"
                                @click="destroy(item)"
                            >
                                <cd-icon name="mdi:delete" />
                            </cd-btn>
                        </div>
                    </template>
                </cd-data-table>
            </cd-card>
        </div>
    </app-layout>
</template>
