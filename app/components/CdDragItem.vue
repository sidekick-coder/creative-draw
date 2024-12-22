<script setup lang="ts">
const model = defineModel({
    type: [String, Object] as PropType<any>,
    required: true,
})

const id =  createId()
const root = ref<HTMLElement>()
const ghost = ref<HTMLElement>()
const items = inject('items', ref<any>([]))

onMounted(() => {
    items.value.push({
        id: id,
        data: model,
    })
})

onUnmounted(() => {
    const index = items.value.findIndex((item: any) => item.id === id)

    if (index === -1) {
        return
    }

    items.value.splice(index, 1)
})

function onDragStart(event: DragEvent) {
    const target = root.value as HTMLElement

    event.dataTransfer!.dropEffect = 'move'
    event.dataTransfer!.effectAllowed = 'move'
    event.dataTransfer!.setData('item_id', id)

    const el = target.cloneNode(true) as HTMLElement

    // el.style.opacity = '0.8'
    el.style.position = 'absolute'
    el.style.pointerEvents = 'none'
    el.style.zIndex = '9999'
    el.style.top = '-9999px'
    el.style.width = target.offsetWidth + 'px'
    el.style.height = target.offsetHeight + 'px'

    document.body.appendChild(el)

    event.dataTransfer!.setDragImage(el, event.offsetX, event.offsetY)

    ghost.value = el
}

function onDragEnd() {
    if (!ghost.value) {
        return
    }

    ghost.value.remove()
}
</script>

<template>
    <div ref="root" draggable="true" :data-id="id" @dragstart="onDragStart" @dragend="onDragEnd">
        <slot></slot>
    </div>
</template>
