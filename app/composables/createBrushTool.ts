import defaultBrush from '@/brushes/basic-10'

export function createBrushTool() {
    const { brushes } = useBrushes()
    const activeId = useLocalStorage('activeBrushId', defaultBrush.id)
    const active = computed(() => brushes.value.find((b) => b.id === activeId.value))
    const settings = ref<BrushDefinition>(defaultBrush)

    function setActive(id: string) {
        activeId.value = id
    }

    function setSettings(payload: Partial<BrushDefinition>) {
        settings.value = copy({
            ...settings.value,
            ...payload,
        })
    }

    watch(
        activeId,
        () => {
            const payload = brushes.value.find((b) => b.id === activeId.value)

            if (payload) {
                settings.value = copy(payload)
            }
        },
        { immediate: true }
    )

    return {
        active,
        activeId,
        settings,

        setActive,
        setSettings,
    }
}
