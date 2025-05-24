import pen from '@/brushes/pen'
import { defineLayerPlugin } from './defineLayerPlugin'
import type { LayerMouseEvent } from './createLayer'

const settings = {
    size: 5,
    color: '#000000',
}

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

        paths = []
    }

    function draw(ctx: CanvasRenderingContext2D) {
        paths.forEach((p) => {
            ctx.fillStyle = p.color
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx.fill()
        })
    }

    return defineLayerPlugin({
        install(layer) {
            layer.emitter.on('mousedown', (e: LayerMouseEvent) => {
                start(e.x, e.y)
            })

            layer.emitter.on('mousemove', (e: LayerMouseEvent) => {
                move(e.x, e.y, 0.5)
                draw(layer.get('context'))
            })

            layer.emitter.on('mouseup', () => {
                const data = layer.get<any[]>('objects', [])

                data.push({
                    type: 'brush',
                    paths,
                })

                layer.set('objects', data)

                console.log('data', data)

                end()
            })
        },
        draw() {
            console.log('draw')
        },
    })
}
