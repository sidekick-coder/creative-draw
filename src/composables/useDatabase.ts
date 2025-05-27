import type { Database, DatabaseDefinition } from '@/utils/createDatabase'

const databases = ref<DatabaseDefinition[]>([createDefaultDatabase()])

const selectedId = ref<string>('default')

const selected = ref<Database>(createDefaultDatabase())

function select(id: string) {
    const db = databases.value.find((db) => db.id === id)

    if (!db) {
        throw new Error(`Database with id ${id} not found`)
    }

    selectedId.value = db.id
    selected.value = createDatabase(db)
}

export const $database = reactive({
    items: readonly(databases),
    selectedId: readonly(selectedId),
    selected: readonly(selected!),
    select,
})
