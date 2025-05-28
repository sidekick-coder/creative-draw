import pen from '@/brushes/pen'
import type { Board } from './createBoard'
import type { Layer } from './useLayer'
import type { LayerMouseEvent } from './createLayer'

export function createBrush() {
    let drawing = false
    let lastX = 0
    let lastY = 0
    let lastPressure = 0
    let paths = [] as BrushPath[]

    function start(x: number, y: number) {
        drawing = true
        lastX = x
        lastY = y
        paths = []
        const drawPath = pen.draw({
            x: x + 1,
            y: y + 1,
            lastX,
            lastY,
            lastPressure,
            pressure: 0.5,
        })
        paths.push(...drawPath)
    }

    function move(x: number, y: number, pressure: number) {
        if (!drawing) return
        const payload = {
            lastX,
            lastY,
            lastPressure,
            x,
            y,
            pressure,
        }
        paths.push(...pen.draw(payload))
        lastX = x
        lastY = y
        lastPressure = pressure
    }

    function end(layer: Layer) {
        drawing = false
        const items = layer.get<any[]>('data', [])
        items.push({
            type: 'brush',
            paths,
        })
        layer.set('data', items)
        paths = []
    }

    return defineBoardPlugin({
        install(board: Board) {
            watch(board.layers,
                (layers) => {
                    for (const layer of layers) {
                        layer.emitter.on('mousedown', (e: LayerMouseEvent) => {
                            start(e.x, e.y)
                            layer.emitter.emit('draw-paths', paths)
                        })
                        layer.emitter.on('mousemove', (e: LayerMouseEvent) => {
                            move(e.x, e.y, 0.5)
                            layer.emitter.emit('draw-paths', paths)
                        })
                        layer.emitter.on('mouseup', () => end(layer))
                        layer.emitter.on('mouseout', () => end(layer))
                    }
                },
                { immediate: true, deep: true }
            )
        },
    })
}
