<script setup lang="ts">
import type { Instruction, RunPayload, RunResponseItem } from '@/contracts/AdapterRunnerGateway'
import type AdapterRunnerGateway from '@/contracts/AdapterRunnerGateway'
import { $t } from '@/globals/lang'
import AdapterRunnerService from '@/services/AdapterRunnerService'
import { useLocalStorage } from '@vueuse/core'

const emit = defineEmits<{
    (e: 'submit', result: RunResponseItem[]): void
}>()

const generating = ref(false)
const runners = ref<AdapterRunnerGateway[]>([])
const content = ref('')
const runnerId = useLocalStorage<null | string>('image-generation-runner-id', null)

const model = defineModel<boolean>({
    type: Boolean,
    default: false,
})

const instructions = defineModel<Instruction[]>('instructions', {
    type: Array,
    default: () => [],
})

async function loadRunners() {
    const [error, response] = await tryCatch(() => AdapterRunnerService.list())

    if (error) {
        console.error('Failed to load runners:', error)
        return
    }

    runners.value = response
}

async function generate() {
    const runner = runners.value.find((r) => r.id === runnerId.value)

    if (!runner) {
        console.error('Runner not found')
        return
    }

    generating.value = true

    const payload: RunPayload = {
        instructions: [],
    }

    instructions.value.forEach((item) => {
        payload.instructions.push(item)
    })

    payload.instructions.push({
        type: 'text',
        data: content.value,
    })

    const [error, result] = await tryCatch(() => runner.run(payload))

    if (error) {
        console.error('Failed to generate image:', error)
        generating.value = false
        return
    }

    emit('submit', result)

    setTimeout(() => {
        generating.value = false
        model.value = false
    }, 1000)
}

onMounted(loadRunners)
</script>
<template>
    <cd-dialog v-model="model">
        <cd-form @submit="generate">
            <cd-card>
                <cd-card-head class="flex-col items-start">
                    <cd-card-title>{{ $t('Generate image') }}</cd-card-title>
                    <cd-card-subtitle>
                        {{ $t('This will generate an image based on the current context') }}
                    </cd-card-subtitle>
                </cd-card-head>
                <cd-card-content class="flex flex-col gap-y-4">
                    <cd-select
                        v-model="runnerId"
                        :label="$t('Select a runner')"
                        :options="runners"
                        value-key="id"
                        label-key="name"
                    >
                        <template #selection="{ option }">
                            <div class="flex flex-col items-start">
                                <div>{{ option.name }}</div>
                                <div class="text-sm text-body-200">
                                    {{ `${$t('Adapter')}: ${option.adapter.name}` }}
                                </div>
                            </div>
                        </template>
                        <template #option="{ option }">
                            <div>
                                <div>{{ option.name }}</div>
                                <div class="text-sm text-body-200">
                                    {{ `${$t('Adapter')}: ${option.adapter.name}` }}
                                </div>
                            </div>
                        </template>
                    </cd-select>
                    <cd-textarea
                        v-model="content"
                        :label="$t('Prompt')"
                        :placeholder="$t('Describe the image you want to generate')"
                        :rows="3"
                    />
                </cd-card-content>
                <cd-card-footer>
                    <cd-btn variant="tonal" @click="model = false">
                        {{ $t('Cancel') }}
                    </cd-btn>
                    <cd-btn color="primary" :loading="generating" type="submit">
                        {{ $t('Generate') }}
                    </cd-btn>
                </cd-card-footer>
            </cd-card>
        </cd-form>
    </cd-dialog>
</template>
