<script setup lang="ts">
interface DropEvent {
    item: any
    dropTarget: any
}

const emitDrop = defineEmit<(data: DropEvent) => any>('drop')

interface Item {
    id: string
    data: any
}

const items = ref<Item[]>([])

provide('items', items)

function onDrop(event: DragEvent) {
    const id = event.dataTransfer!.getData('item_id')

    const item = items.value.find((item: any) => item.id === id)

    if (!item) {
        return
    }

    const target = event.currentTarget as HTMLElement

    const rects = Array.from(target.children).map((c: any) => ({
        id: c.dataset.id,
        rect: c.getBoundingClientRect(),
    }))

    const dropTarget = rects.find((rect) => {
        return event.clientY >= rect.rect.top && event.clientY <= rect.rect.bottom
    })

    const dropTargetItem = items.value.find((item: any) => item.id === dropTarget?.id)

    emitDrop({
        item: item.data,
        dropTarget: dropTargetItem?.data,
    })
}
</script>

<template>
    <div @drop.prevent="onDrop" @dragover.prevent>
        <slot></slot>
    </div>
</template>
