import pen from '@/brushes/pen'
import { defineLayerPlugin } from './defineLayerPlugin'
import type { LayerMouseEvent } from './createLayer'
import type { Layer } from './useLayer'

export function createBrush() {
    let layer: Layer
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

    function end() {
        drawing = false

        const items = layer.get<any[]>('data', [])

        items.push({
            type: 'brush',
            paths,
        })

        layer.set('data', items)

        paths = []
    }

    return defineLayerPlugin({
        install(_layer) {
            layer = _layer

            layer.emitter.on('mousedown', (e: LayerMouseEvent) => {
                start(e.x, e.y)

                layer.emitter.emit('draw-paths', paths)
            })

            layer.emitter.on('mousemove', (e: LayerMouseEvent) => {
                move(e.x, e.y, 0.5)

                layer.emitter.emit('draw-paths', paths)
            })

            layer.emitter.on('mouseup', end)
            layer.emitter.on('mouseout', end)
        },
    })
}
