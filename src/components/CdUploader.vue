<script setup lang="ts">
import File from '@/entities/File'
import Drive from '@/facades/Drive'

defineOptions({
    inheritAttrs: false,
})

const props = defineProps<{
    multiple?: boolean
    accept?: string
}>()

const emit = defineEmits<{
    (event: 'result', files: File[]): void
}>()

const menu = ref(false)

async function onClick() {
    const picked = await $file.pick({
        multiple: props.multiple,
        accept: props.accept,
    })

    const files = (Array.isArray(picked) ? picked : [picked]) as globalThis.File[]

    if (!files || files.length === 0) {
        return
    }

    const entities = await Promise.all(files.map($file.upload))

    if (entities.length === 0) {
        return
    }

    emit('result', entities)

    menu.value = false
}

const tab = ref('upload')

// drive
const driveFiles = ref<File[]>([])

async function loadFiles() {
    const [error, result] = await tryCatch(() => Drive.list())
    if (error) {
        console.error('Failed to fetch drive files:', error)
        return
    }

    driveFiles.value = result || []
}

function onDriveFileClick(file: File) {
    emit('result', [file])

    menu.value = false
}

watch(tab, (newTab) => {
    if (newTab === 'drive' && driveFiles.value.length === 0) {
        loadFiles()
    }
})
</script>
<template>
    <cd-menu v-model="menu" :close-on-content-click="false" :close-on-click="false">
        <template #activator="{ attrs }">
            <slot name="activator" :attrs="attrs">
                <cd-btn color="primary" @click="onClick">
                    <cd-icon name="heroicons:arrow-up-tray" class="mr-2" />
                    Upload
                </cd-btn>
            </slot>
        </template>

        <cd-card class="bg-body-600 min-w-[300px]">
            <div class="flex p-2 gap-2 border-b-2 border-body-500">
                <button
                    class="flex-1 text-left px-4 py-2 rounded-md"
                    :class="tab === 'upload' ? 'bg-body-100' : 'bg-body-800'"
                    @click="tab = 'upload'"
                >
                    {{ $t('Upload') }}
                </button>
                <button
                    class="flex-1 text-left px-4 py-2 rounded-md"
                    :class="tab === 'drive' ? 'bg-body-100' : 'bg-body-800'"
                    @click="tab = 'drive'"
                >
                    {{ $t('Drive') }}
                </button>
            </div>
            <div v-if="tab === 'upload'" class="flex items-center justify-center p-2">
                <cd-btn
                    color="none"
                    class="h-40 w-80 border-dashed border-2 border-body-100"
                    @click="onClick"
                >
                    <cd-icon name="heroicons:arrow-up-tray" class="size-20 text-body-100" />
                </cd-btn>
            </div>
            <div v-else-if="tab === 'drive'" class="flex flex-wrap w-96">
                <div
                    v-for="file in driveFiles"
                    :key="file.id"
                    class="size-24 p-2"
                    @click.stop="onDriveFileClick(file)"
                >
                    <div
                        class="border border-dashed size-full border-body-200 rounded-md flex items-center justify-center"
                    >
                        <cd-img
                            v-if="file.mimetype.startsWith('image/')"
                            :src="file.src"
                            no-dialog
                        />
                        <cd-icon
                            v-else
                            :name="File.icon(file.filename)"
                            class="size-8 text-body-100"
                        />
                    </div>
                </div>
            </div>
        </cd-card>
    </cd-menu>
</template>
