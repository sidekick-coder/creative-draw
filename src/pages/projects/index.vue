<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'

// general
const router = useRouter()

// sizes
const dialog = ref(false)
const predefinedSizes = useLocalStorage<any[]>('predefined-sizes', [])

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
const loading = ref(false)

async function setProjects() {
    loading.value = true

    await $project.load()

    setTimeout(() => {
        loading.value = false
    }, 500)
}

onMounted(() => {
    setProjects()
})

// delete
const deletingId = ref<string>()

async function deleteItem(project: DBProject) {
    const db = $database.selected

    deletingId.value = project.id

    await db.projects.destroy(project.id)

    setProjects()
}
// create
async function create(width: number, height: number) {
    const db = $database.selected

    const project = await db.projects.create({
        name: 'New Project',
        width: Number(width),
        height: Number(height),
    })

    const existsInPredefined = predefinedSizes.value.find(
        (size) => size.width === width && size.height === height
    )

    const existsInSizes = sizes.find((size) => {
        if (size.width === width && size.height === height) {
            return true
        }

        if (size.width === height && size.height === width) {
            return true
        }

        return false
    })

    if (!existsInPredefined && !existsInSizes) {
        predefinedSizes.value.push({
            label: `${width} x ${height}`,
            width,
            height,
        })
    }

    router.push(`/projects/${project.id}`)
}
</script>

<template>
    <app-layout>
        <div class="w-full flex h-full flex-col lg:flex-row">
            <div class="flex-1 overflow-y-auto">
                <div class="flex w-full flex-col md:flex-row px-5 py-4 items-center">
                    <cd-menu>
                        <template #activator="{ attrs }">
                            <cd-btn v-bind="attrs" color="body-700" class="gap-x-2">
                                <cd-icon name="heroicons:circle-stack" />
                                <div>{{ $database.selected?.name }}</div>
                            </cd-btn>
                        </template>

                        <div class="p-2">
                            <cd-card class="w-80">
                                <cd-list-item
                                    v-for="db in $database.items"
                                    :key="db.id"
                                    @click="$database.select(db.id)"
                                >
                                    <div>{{ db.name }}</div>
                                </cd-list-item>
                            </cd-card>
                        </div>
                    </cd-menu>

                    <div class="flex-1" />

                    <div class="flex gap-x-2">
                        <cd-btn color="body-700" :loading="loading" @click="setProjects">
                            <cd-icon name="heroicons:arrow-path-20-solid" />
                        </cd-btn>

                        <cd-menu>
                            <template #activator="{ attrs }">
                                <cd-btn v-bind="attrs" color="body-700">
                                    {{ $t('create') }}
                                </cd-btn>
                            </template>

                            <div class="p-2">
                                <cd-card class="w-80">
                                    <cd-list-item
                                        v-for="size in sizes"
                                        :key="size.label"
                                        @click="create(size.width, size.height)"
                                    >
                                        <div class="flex-1">{{ size.label }}</div>

                                        <cd-btn
                                            color="body-700"
                                            padding="none"
                                            size="sm"
                                            @click.stop="create(size.width, size.height)"
                                        >
                                            <cd-icon name="streamline:orientation-portrait-solid" />
                                        </cd-btn>

                                        <cd-btn
                                            color="body-700"
                                            padding="none"
                                            size="sm"
                                            @click.stop="create(size.height, size.width)"
                                        >
                                            <cd-icon
                                                name="streamline:orientation-landscape-solid"
                                            />
                                        </cd-btn>
                                    </cd-list-item>

                                    <template v-if="predefinedSizes.length">
                                        <cd-list-item
                                            v-for="(s, index) in predefinedSizes"
                                            :key="s.label"
                                            @click="create(s.width, s.height)"
                                        >
                                            <div class="flex-1">{{ s.label }}</div>

                                            <cd-btn
                                                color="body-700"
                                                padding="none"
                                                size="sm"
                                                @click.stop="predefinedSizes.splice(index, 1)"
                                            >
                                                <cd-icon name="heroicons:trash-20-solid" />
                                            </cd-btn>
                                        </cd-list-item>
                                    </template>

                                    <cd-list-item @click="dialog = true">
                                        {{ $t('custom') }}
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

                            <cd-btn @click="create(customSize.width, customSize.height)">
                                {{ $t('create') }}
                            </cd-btn>
                        </cd-card-content>
                    </cd-card>
                </cd-dialog>

                <div class="flex flex-wrap items-start gap-y-4 [&>*]:px-2 relative px-2">
                    <div
                        v-if="loading && !$project.items.length"
                        class="absolute inset-0 flex items-center justify-center"
                    >
                        <cd-spinner class="text-2xl" />
                    </div>

                    <div v-else-if="!$project.items.length" color="none" class="text-body-500">
                        <cd-card-content> No projects yet </cd-card-content>
                    </div>

                    <div
                        v-for="project in $project.items"
                        :key="project.id"
                        class="w-full md:w-3/12"
                    >
                        <cd-card
                            class="relative h-0 w-full pb-[75%]"
                            :to="`/projects/${project.id}`"
                        >
                            <project-thumbnail
                                :project="project"
                                class="absolute size-full object-cover"
                            />
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
        </div>
    </app-layout>
</template>
