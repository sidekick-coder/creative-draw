import type { Brush, BrushSettings } from './defineBrush'

interface Options {
    brushes: Brush[] | Ref<Brush[]>
    selected: string | Ref<string>
    settings: BrushSettings | Ref<BrushSettings>
}

interface DrawOptions {
    ctx: CanvasRenderingContext2D
    event: PointerEvent
}

export function useBrush({ brushes: _brushes, selected: _selected, settings: _settings }: Options) {
    const brushes = isRef(_brushes) ? _brushes : ref(_brushes)
    const selected = isRef(_selected) ? _selected : ref(_selected)
    const settings = isRef(_settings) ? _settings : ref(_settings)
    const isDrawing = ref(false)

    const brush = computed(() => {
        return brushes.value.find((b) => b.name === selected.value)
    })

    function start({ ctx, event }: DrawOptions) {
        isDrawing.value = true

        const { offsetX, offsetY } = event

        brush.value?.start({
            position: { x: offsetX, y: offsetY },
            settings: settings.value,
            event,
            ctx,
            pressure: event.pressure,
        })
    }

    function draw({ event, ctx }: DrawOptions) {
        const { offsetX, offsetY } = event

        brush.value?.draw({
            position: { x: offsetX, y: offsetY },
            settings: settings.value,
            event,
            ctx,
            pressure: event.pressure,
        })
    }

    function stop({ event, ctx }: DrawOptions) {
        if (!isDrawing.value) return

        brush.value?.stop({
            position: { x: event.offsetX, y: event.offsetY },
            settings: settings.value,
            event,
            ctx,
            pressure: event.pressure,
        })

        isDrawing.value = false
    }

    return { start, draw, stop, brush }
}
