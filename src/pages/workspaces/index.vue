<script setup lang="ts">
import WorkspaceRepository from '@/repositories/WorkspaceRepository'
import Workspace from '@/entities/Workspace'

const repository = new WorkspaceRepository()

// State
const workspaces = ref<Workspace[]>([])
const loading = ref(true)
const showCreateDialog = ref(false)

// Form data
const newWorkspace = ref({
    name: '',
    description: '',
    type: 'index-db' as 'index-db' | 'filesystem',
    directoryHandle: null as any,
})

// Folder picker for filesystem type
async function pickFolder() {
    try {
        // Check if File System Access API is supported
        if ('showDirectoryPicker' in window) {
            const dirHandle = await (window as any).showDirectoryPicker({
                mode: 'readwrite',
            })
            newWorkspace.value.directoryHandle = dirHandle
        } else {
            // Fallback: show a message for unsupported browsers
            alert(
                'File System Access API is not supported in this browser. Please use a modern browser like Chrome, Edge, or Safari.'
            )
        }
    } catch (_error) {
        // User cancelled the picker
        console.log('Folder selection cancelled')
    }
}

// Load workspaces
async function loadWorkspaces() {
    loading.value = true

    const [error, items] = await tryCatch(() => repository.list())

    if (error) {
        loading.value = false
        return
    }

    workspaces.value = items.filter((w) => !w.deletedAt)

    loading.value = false
}

// Create workspace
async function createWorkspace() {
    if (!newWorkspace.value.name.trim()) {
        return
    }

    const [error] = await tryCatch(() =>
        repository.create({
            name: newWorkspace.value.name.trim(),
            description: newWorkspace.value.description.trim(),
            type: newWorkspace.value.type,
            config: {
                ...(newWorkspace.value.type === 'filesystem' && {
                    handle: newWorkspace.value.directoryHandle,
                }),
            },
        })
    )

    if (error) {
        return
    }

    // Reset form
    newWorkspace.value = {
        name: '',
        description: '',
        type: 'index-db',
        directoryHandle: null,
    }

    showCreateDialog.value = false

    await loadWorkspaces()
}

// Delete workspace
async function deleteWorkspace(workspace: Workspace) {
    await repository.destroy(workspace.id)

    await loadWorkspaces()
}

// Load workspaces on mount
onMounted(() => {
    loadWorkspaces()
})
</script>

<template>
    <div class="min-h-screen flex items-center justify-center p-6">
        <cd-card class="w-full max-w-6xl border-none" color="none">
            <!-- Header -->
            <cd-card-head class="text-center flex-col">
                <div class="flex-1">
                    <cd-card-title>Workspaces</cd-card-title>
                    <cd-card-subtitle>Manage your creative workspaces</cd-card-subtitle>
                </div>
            </cd-card-head>

            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <CdSpinner class="w-8 h-8" />
            </div>

            <!-- Empty State -->
            <cd-card v-if="!workspaces.length" class="flex flex-col items-center text-center py-12">
                <CdIcon name="folder" class="w-16 h-16 text-body-400 mx-auto mb-4" />
                <h3 class="text-xl font-semibold text-white mb-2">No workspaces yet</h3>
                <p class="text-body-300 mb-6">Create your first workspace to get started</p>
                <CdBtn color="primary" @click="showCreateDialog = true">
                    {{ $t('Create') }}
                </CdBtn>
            </cd-card>

            <!-- Workspaces Grid -->
            <cd-card-content
                v-else
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[260px]"
            >
                <CdCard v-for="workspace in workspaces" :key="workspace.id" class="flex flex-col">
                    <cd-card-head>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-lg font-semibold truncate mb-1">
                                {{ workspace.name }}
                            </h3>
                            <div class="text-xs text-body-50">
                                {{
                                    workspace.type === 'index-db'
                                        ? 'Browser Storage'
                                        : 'File System'
                                }}
                            </div>
                        </div>

                        <cd-alert @confirm="deleteWorkspace(workspace)">
                            <template #activator="{ attrs }">
                                <CdBtn
                                    color="danger"
                                    variant="text"
                                    class="p-2 ml-2"
                                    v-bind="attrs"
                                >
                                    <CdIcon name="trash" class="w-4 h-4" />
                                </CdBtn>
                            </template>
                        </cd-alert>
                    </cd-card-head>

                    <CdCardContent>
                        <p class="text-body-300 text-sm mb-4">
                            {{ workspace.description || $t('No description available') }}
                        </p>

                        <!-- Show folder name for filesystem workspaces -->
                        <div
                            v-if="workspace.type === 'filesystem' && workspace.config?.handle"
                            class="text-xs text-body-400 flex items-center mt-2"
                        >
                            <CdIcon name="folder" class="w-3 h-3 mr-1" />
                            {{ workspace.config.handle.name }}
                        </div>
                    </CdCardContent>

                    <cd-card-footer class="mt-auto">
                        <CdBtn class="w-full" :to="`/workspaces/${workspace.id}`">
                            {{ $t('Open Workspace') }}
                        </CdBtn>
                    </cd-card-footer>
                </CdCard>
                <CdCard
                    class="flex items-center justify-center cursor-pointer"
                    @click="showCreateDialog = true"
                >
                    <div class="flex flex-col gap-2 items-center">
                        <cd-icon name="plus" class="size-8"></cd-icon>
                        <div>
                            {{ $t('Add new') }}
                        </div>
                    </div>
                </CdCard>
            </cd-card-content>

            <!-- Create Workspace Dialog -->
            <CdDialog v-model="showCreateDialog">
                <CdCard class="w-md">
                    <cd-card-head>
                        <cd-card-title>{{ $t('Create') }}</cd-card-title>
                    </cd-card-head>

                    <div class="card-content space-y-4">
                        <CdTextField
                            v-model="newWorkspace.name"
                            :label="$t('Name')"
                            :placeholder="$t('Enter workspace name...')"
                        />

                        <CdSelect
                            v-model="newWorkspace.type"
                            :label="$t('Type')"
                            :options="[
                                { value: 'index-db', label: 'Browser Storage (IndexedDB)' },
                                { value: 'filesystem', label: 'File System' },
                            ]"
                            label-key="label"
                            value-key="value"
                        />

                        <!-- Folder Picker (only for filesystem type) -->
                        <cd-text-field
                            v-if="newWorkspace.type === 'filesystem'"
                            :label="$t('Folder')"
                            :model-value="
                                newWorkspace.directoryHandle
                                    ? newWorkspace.directoryHandle.name
                                    : ''
                            "
                            readonly
                            :placeholder="$t('Select a folder to store workspace files')"
                            class="cursor-pointer"
                            @click="pickFolder"
                        >
                            <template #append>
                                <cd-icon name="folder" class="w-4 h-4 text-body-400" />
                            </template>
                        </cd-text-field>

                        <p class="text-xs text-body-400">
                            {{ $t('Choose the folder where workspace files will be stored') }}
                        </p>

                        <CdTextarea
                            v-model="newWorkspace.description"
                            label="Description (Optional)"
                            placeholder="Describe your workspace..."
                            rows="3"
                        />
                    </div>

                    <cd-card-footer>
                        <CdBtn class="flex-1" color="danger" @click="showCreateDialog = false">
                            Cancel
                        </CdBtn>
                        <CdBtn
                            color="primary"
                            class="flex-1"
                            :disabled="
                                !newWorkspace.name.trim() ||
                                (newWorkspace.type === 'filesystem' &&
                                    !newWorkspace.directoryHandle)
                            "
                            @click="createWorkspace"
                        >
                            Create
                        </CdBtn>
                    </cd-card-footer>
                </CdCard>
            </CdDialog>
        </cd-card>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
