<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { createAutoreloadPull } from '@/composables/createAutoreloadPull'
import WorkspaceGatewayFileSystem from '@/gateways/WorkspaceGatewayFilesystem'

const props = defineProps<{ projectId: string }>()
const emit = defineEmits<{ changed: [] }>()

const model = defineModel<boolean>()

const workspace = useWorkspace()
const isFilesystem = computed(() => workspace.type === 'filesystem')

const active = useLocalStorage('cd-board-autoreload-active', false)
const strategy = useLocalStorage<'pull' | 'observer'>('cd-board-autoreload-strategy', 'pull')

const localActive = ref(active.value)
const localStrategy = ref(strategy.value)

watch(model, (v) => {
    if (v) {
        localActive.value = active.value
        localStrategy.value = strategy.value
    }
})

const strategyOptions = [
    { label: 'Pull', value: 'pull' },
    { label: 'Observer', value: 'observer' },
]

function confirm() {
    active.value = localActive.value
    strategy.value = localStrategy.value
    model.value = false
}

function cancel() {
    model.value = false
}

// watcher
const projectId = computed(() => props.projectId)

let pull = null

if (isFilesystem.value) {
    pull = createAutoreloadPull((workspace as WorkspaceGatewayFileSystem).drive, projectId, () =>
        emit('changed')
    )
}

watch(
    [active, strategy],
    ([isActive, currentStrategy]) => {
        pull?.stop()

        if (isActive && currentStrategy === 'pull') {
            pull?.start()
        }
    },
    { immediate: true }
)

onUnmounted(() => pull?.stop())
</script>
<template>
    <cd-dialog v-model="model">
        <cd-card class="w-80">
            <cd-card-head>
                <cd-card-title class="mr-auto text-base">
                    {{ $t('Filesystem Auto Reload') }}
                </cd-card-title>
            </cd-card-head>
            <cd-card-content class="flex flex-col gap-y-4">
                <p v-if="!isFilesystem" class="text-sm text-body-300">
                    {{ $t('The current workspace does not support this feature') }}
                </p>

                <template v-else>
                    <div class="flex items-center justify-between">
                        <span class="text-sm">{{ $t('Active') }}</span>
                        <cd-switch v-model="localActive" />
                    </div>

                    <cd-select
                        v-model="localStrategy"
                        :label="$t('Strategy')"
                        :options="strategyOptions"
                        value-key="value"
                        label-key="label"
                    />
                </template>
            </cd-card-content>
            <cd-card-footer>
                <cd-btn variant="outlined" class="flex-1" @click="cancel">
                    {{ $t('Cancel') }}
                </cd-btn>
                <cd-btn class="flex-1" :disabled="!isFilesystem" @click="confirm">
                    {{ $t('Confirm') }}
                </cd-btn>
            </cd-card-footer>
        </cd-card>
    </cd-dialog>
</template>
