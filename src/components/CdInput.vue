<script lang="ts">
export interface InputMessage {
    type: 'danger' | 'warning' | 'info' | 'success'
    message: string
}
</script>
<script lang="ts" setup>
// general
const className = defineProp<string>('class', {
    type: String,
    default: null,
})

const instance = getCurrentInstance()

const { set, classes } = useClassBuilder(className)

set('base', 'relative group transition-colors duration-200 flex flex-col gap-y-2 w-full')

// label
const labelClass = defineProp<string>('label-class', {
    type: String,
    default: null,
})

const label = defineProp<string>('label', {
    type: String,
    default: null,
})

// input container
const inputContainerClassName = defineProp<string>('inputContainerClass', {
    type: String,
    default: null,
})

const { classes: inputContainerClasses, set: setContainer } = useClassBuilder({
    class: inputContainerClassName,
})

setContainer('base', [
    'flex items-center',
    'w-full',
    'border-2',
    'border-body-200',
    'rounded',
    'transition-colors duration-200',
    'group-focus-within:border-primary-300',
    'group-data-[error=true]:border-danger-300',
])

// icons
const appendClassName = defineProp<string>('append-class', {
    type: String,
    default: null,
})

const { classes: appendClasses, set: setAppend } = useClassBuilder({
    class: appendClassName,
})

setAppend('base', ['px-4', 'text-body-100 group-focus-within:text-primary-300'])

// others
const loading = defineProp<boolean>('loading', {
    type: Boolean,
    default: false,
})

const id = defineProp<string>('id', {
    type: String,
    default: null,
})

const internalId = id.value || useId()

// icons
const iconLeft = defineProp<string>('iconLeft', {
    type: String,
    default: null,
})

const iconRight = defineProp<string>('iconRight', {
    type: String,
    default: null,
})

const emitClickIconRight = defineEmit('click:icon-right')
const emitClickIconLeft = defineEmit('click:icon-left')

// disabled
const disabled = defineProp<boolean>('disabled', {
    type: Boolean,
    default: false,
})

function setDisabled(value: boolean) {
    if (value) {
        setContainer('disabled', 'border-dashed')
        return
    }

    setContainer('disabled', '')
}

watch(disabled, setDisabled, {
    immediate: true,
})

// messages
const messages = defineProp<InputMessage[]>('messages', {
    type: Array,
    default: () => [],
})

const hasError = defineProp<boolean>('hasError', {
    type: Boolean,
    default: false,
})
</script>

<template>
    <div :class="classes" :data-error="hasError">
        <cd-input-label
            v-if="label"
            :for="internalId"
            :class="labelClass"
            class="group-data-[error=true]:text-danger-300 group-focus-within:text-primary-300"
        >
            {{ label }}
        </cd-input-label>

        <div :class="inputContainerClasses">
            <div v-if="$slots.prepend || iconLeft" class="pl-4">
                <slot name="prepend">
                    <cd-icon
                        v-if="iconLeft"
                        :name="iconLeft"
                        class="text-lg text-body-100 transition-colors duration-200 group-focus-within:text-primary-300"
                        @click="emitClickIconLeft"
                    />
                </slot>
            </div>
            <slot :id="internalId"></slot>

            <div v-if="loading || $slots.append || iconRight" :class="appendClasses">
                <cd-spinner v-if="loading" size="24" />
                <slot v-else name="append">
                    <cd-icon
                        v-if="iconRight"
                        :name="iconRight"
                        class="text-lg text-body-100 transition-colors duration-200 group-focus-within:text-primary-300"
                        :class="
                            instance?.vnode?.props?.['onClick:iconRight']
                                ? 'cursor-pointer'
                                : 'cursor-default'
                        "
                        @click="emitClickIconRight"
                    />
                </slot>
            </div>
        </div>

        <div
            v-for="message in messages"
            :key="message.message"
            class="py-1 text-xs text-danger-300"
        >
            {{ message.message }}
        </div>
    </div>
</template>
