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

        paths.push(...pen.draw({ x, y, lastX, lastY, lastPressure, pressure: 0.5 }))
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

    function clear() {
        const ctx = layer.get<CanvasRenderingContext2D>('context')

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }

    function draw(pathsToDraw: BrushPath[]) {
        const ctx = layer.get<CanvasRenderingContext2D>('context')

        pathsToDraw.forEach((p) => {
            ctx.fillStyle = p.color
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx.fill()
        })
    }

    function redraw() {
        clear()

        const items = layer.get<any[]>('data', [])

        console.log('redraw')
        items.forEach((item) => {
            if (item.type === 'brush') {
                draw(item.paths)
            }
        })
    }

    return defineLayerPlugin({
        install(_layer) {
            layer = _layer

            layer.emitter.on('render', redraw)

            layer.emitter.on('mousedown', (e: LayerMouseEvent) => {
                start(e.x, e.y)
                draw(paths)
            })

            layer.emitter.on('mousemove', (e: LayerMouseEvent) => {
                move(e.x, e.y, 0.5)
                draw(paths)
            })

            layer.emitter.on('mouseup', end)
            layer.emitter.on('mouseout', end)
        },
        draw,
        redraw,
        clear,
    })
}
