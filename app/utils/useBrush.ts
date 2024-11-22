import pen from '~/brushes/pen'
import type { Brush } from './defineBrush'

export function useBrush() {
    const brushes = ref<Brush[]>([])
    const brush = ref<Brush>()
    const settings = ref({
        color: '#eee',
        size: 1,
    })

    function load(ctx: CanvasRenderingContext2D) {
        brushes.value = [pen(ctx)]
        brush.value = brushes.value[0]
    }

    function setBrush(index: number) {
        brush.value = brushes.value[index]
    }

    function start(event: MouseEvent) {
        const { offsetX, offsetY } = event

        brush.value?.start({
            position: { x: offsetX, y: offsetY },
            settings: settings.value,
            event,
        })
    }

    function draw(event: MouseEvent) {
        const { offsetX, offsetY } = event

        brush.value?.draw({
            position: { x: offsetX, y: offsetY },
            settings: settings.value,
            event,
        })
    }

    function stop(event: MouseEvent) {
        brush.value?.stop({
            position: { x: event.offsetX, y: event.offsetY },
            settings: settings.value,
            event,
        })
    }

    return { brushes, brush, load, setBrush, start, draw, stop }
}
