const files = import.meta.glob<{ default: BrushDefinition }>('@/brushes/*.ts', {
    eager: true,
})

const allBrushes = Object.values(files).map((f) => f.default)

const items = ref(allBrushes)

export function useBrushes() {
    return {
        brushes: readonly(items),
    }
}
