<script setup lang="ts">
import {
    deleteProject,
    importProjectFromHandle,
    listProjects,
    providers,
} from '~/repositories/projectRepository'

definePageMeta({
    tile: 'Creative draw',
})

defineOptions({
    name: 'Home',
})

// sizes
const dialog = ref(false)

const customSize = ref({
    width: 2480,
    height: 3508,
})

const sizes = [
    {
        label: 'A4 300dpi',
        width: 2480,
        height: 3508,
    },
    {
        label: 'A5 300dpi',
        width: 1748,
        height: 2480,
    },
    {
        label: 'A6 300dpi',
        width: 1240,
        height: 1748,
    },
]

// projects
const loading = ref(true)
const projects = ref<ProjectDataWithIdAndType[]>([])
const deletingId = ref<string>()

async function setProjects() {
    loading.value = true

    const [response, error] = await tryCatch(() => listProjects())

    if (error) {
        console.error(error)
        loading.value = false
        return
    }

    projects.value = response

    setTimeout(() => {
        loading.value = false
    }, 500)
}

async function deleteItem(project: DBProject) {
    deletingId.value = project.id

    await deleteProject(project.id)

    setProjects()
}

async function importProject() {
    const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
    })

    await importProjectFromHandle(handle)

    await setProjects()
}

onMounted(setProjects)
</script>

<template>
    <div class="w-dvh flex h-dvh flex-col lg:flex-row">
        <div class="flex-1 overflow-y-auto p-5">
            <div class="mb-8 flex w-full flex-col md:flex-row">
                <h1 class="mb-4 flex-1 text-2xl font-bold">Projects</h1>

                <div class="flex gap-x-2">
                    <cd-menu>
                        <template #activator="{ attrs }">
                            <cd-btn v-bind="attrs" color="body-700"> Import </cd-btn>
                        </template>

                        <div class="p-2">
                            <cd-card class="w-80">
                                <cd-card-head>
                                    <cd-card-title class="mr-auto text-base">
                                        Import project
                                    </cd-card-title>
                                </cd-card-head>

                                <client-only>
                                    <cd-list-item
                                        class="mr-auto flex-col items-start text-base"
                                        :disabled="!$flags.fsa"
                                        @click="importProject"
                                    >
                                        <div>Select folder</div>

                                        <div v-if="!$flags.fsa" class="text-xs text-body-200">
                                            Not available in this browser
                                        </div>
                                    </cd-list-item>
                                </client-only>
                            </cd-card>
                        </div>
                    </cd-menu>

                    <cd-menu>
                        <template #activator="{ attrs }">
                            <cd-btn v-bind="attrs" color="body-700"> Create </cd-btn>
                        </template>

                        <div class="p-2">
                            <cd-card class="w-80">
                                <cd-list-item @click="dialog = true">Custom size</cd-list-item>
                                <cd-list-item
                                    class="py-2 text-sm font-bold text-body-100"
                                    color="none"
                                >
                                    {{ $t('predefinedSizes') }}
                                </cd-list-item>

                                <cd-list-item
                                    v-for="size in sizes"
                                    :key="size.label"
                                    @click="
                                        navigateTo(`/app?width=${size.width}&height=${size.height}`)
                                    "
                                >
                                    <div class="flex-1">{{ size.label }}</div>

                                    <cd-btn
                                        color="body-700"
                                        padding="none"
                                        size="sm"
                                        :to="`/app?width=${size.width}&height=${size.height}`"
                                    >
                                        <cd-icon name="streamline:orientation-portrait-solid" />
                                    </cd-btn>

                                    <cd-btn
                                        color="body-700"
                                        padding="none"
                                        size="sm"
                                        :to="`/app?width=${size.height}&height=${size.width}`"
                                    >
                                        <cd-icon name="streamline:orientation-landscape-solid" />
                                    </cd-btn>
                                </cd-list-item>
                            </cd-card>
                        </div>
                    </cd-menu>
                </div>
            </div>

            <cd-dialog v-model="dialog">
                <cd-card>
                    <cd-card-head>
                        <cd-card-title class="mr-auto text-base">Custom size</cd-card-title>
                    </cd-card-head>

                    <cd-card-content class="flex flex-col gap-y-4">
                        <cd-text-field
                            v-model="customSize.width"
                            label="Width"
                            type="number"
                            placeholder="Width"
                        />
                        <cd-text-field
                            v-model="customSize.height"
                            label="Height"
                            type="number"
                            placeholder="Height"
                        />

                        <cd-btn :to="`/app?width=${customSize.width}&height=${customSize.height}`">
                            Create
                        </cd-btn>
                    </cd-card-content>
                </cd-card>
            </cd-dialog>

            <div class="-mx-2 flex flex-wrap items-start gap-y-4 [&>*]:px-2">
                <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
                    <cd-spinner class="text-2xl" />
                </div>

                <div v-else-if="!projects.length" color="none" class="text-body-500">
                    <cd-card-content> No projects yet </cd-card-content>
                </div>

                <div v-for="project in projects" :key="project.id" class="w-full md:w-3/12">
                    <cd-card
                        class="relative h-0 w-full pb-[75%]"
                        :to="`/app?projectId=${project.id}`"
                    >
                        <img
                            v-if="project.thumbnail"
                            :src="project.thumbnail"
                            class="absolute size-full object-cover"
                        />

                        <div class="absolute bottom-2 right-2">
                            <cd-badge-status
                                :items="providers"
                                :model-value="project.type"
                                value-key="id"
                            />
                        </div>
                    </cd-card>

                    <div class="mt-2 flex">
                        <div class="flex-1">
                            <div class="font-bold text-body-50">
                                {{ project.name || 'No title' }}
                            </div>
                            <div class="text-sm text-body-500">
                                {{ project.width }} x {{ project.height }}
                            </div>
                        </div>

                        <cd-menu>
                            <template #activator="{ attrs }">
                                <cd-btn
                                    v-bind="attrs"
                                    variant="text"
                                    color="body-700"
                                    padding="none"
                                    size="sm"
                                >
                                    <cd-icon name="heroicons:ellipsis-vertical-20-solid" />
                                </cd-btn>
                            </template>

                            <div class="p-2">
                                <cd-card class="w-40">
                                    <cd-list-item @click="deleteItem(project)">
                                        Delete
                                    </cd-list-item>
                                </cd-card>
                            </div>
                        </cd-menu>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="flex h-40 w-full flex-col gap-y-8 overflow-auto bg-body-700 lg:h-full lg:w-3/12 xl:w-2/12"
        >
            <client-only>
                <cd-ad />
            </client-only>
        </div>
    </div>
</template>
