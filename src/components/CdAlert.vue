<script lang="ts" setup>
const model = defineModel({
    type: Boolean,
})

const emit = defineEmits(['confirm', 'cancel'])

function onConfirm() {
    emit('confirm')
    model.value = false
}

function onCancel() {
    emit('cancel')
    model.value = false
}
</script>
<template>
    <slot
        name="activator"
        :show="model"
        :attrs="{
            onClick: () => {
                model = true
            },
        }"
    />

    <CdDialog v-model="model">
        <CdCard class="w-full w-md">
            <cd-card-head>
                <cd-card-title>{{ $t('Are you sure?') }}</cd-card-title>
            </cd-card-head>

            <cd-card-content>
                {{ $t('This action cannot be undone.') }}
            </cd-card-content>

            <cd-card-footer>
                <CdBtn variant="outlined" class="flex-1" @click="onCancel">
                    {{ $t('Cancel') }}
                </CdBtn>
                <CdBtn color="danger" class="flex-1" @click="onConfirm">
                    {{ $t('Confirm') }}
                </CdBtn>
            </cd-card-footer>
        </CdCard>
    </CdDialog>
</template>
