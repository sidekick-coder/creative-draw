interface Project {
    id: string
    name: string
    created_at: string
    updated_at: string
}

const items = ref<Project[]>([])

async function load() {
    const db = $database.selected

    if (!db) {
        items.value = []
        return
    }

    items.value = await db.projects.list()
}

watch(() => $database.selected, load, { immediate: true })

export const $project = reactive({
    items: readonly(items),
    load,
})
