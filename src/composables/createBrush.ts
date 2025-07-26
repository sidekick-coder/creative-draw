import pen from '@/brushes/pen'
import type { Board } from './createBoard'
import type { Layer } from './useLayer'
import type { LayerMouseEvent } from './createLayer'
import type { ColorRGB } from '@/utils/colors'

export interface CreateBrushOptions {
    size?: MaybeRef<number>
    opacity?: MaybeRef<number>
    color?: MaybeRef<ColorRGB>
}

export function createBrush(options?: CreateBrushOptions) {
    const size = toRef(options?.size ?? 1)
    const opacity = toRef(options?.opacity ?? 1)
    const color = toRef(options?.color ?? { r: 0, g: 0, b: 0 })

    let drawing = false
    let lastX = 0
    let lastY = 0
    let lastPressure = 0
    let paths = [] as BrushPath[]

    function start(layer: Layer, x: number, y: number) {
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
            size: size.value,
            opacity: opacity.value,
            color: color.value,
        })
        paths.push(...drawPath)
        layer.emitter.emit('paths:begin')
        layer.emitter.emit('paths:draw', paths)
    }

    function move(layer: Layer, x: number, y: number, pressure: number) {
        if (!drawing) return

        const payload = {
            lastX,
            lastY,
            lastPressure,
            x,
            y,
            pressure,
            size: size.value,
            opacity: opacity.value,
            color: color.value,
        }

        paths.push(...pen.draw(payload))
        lastX = x
        lastY = y
        lastPressure = pressure
        layer.emitter.emit('paths:draw', paths)
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
        layer.emitter.emit('paths:end')
    }

    return defineBoardPlugin({
        install(board: Board) {
            board.emitter.on('layer:add', (layer: Layer) => {
                console.log('[brush] installing on layer', layer.id)

                layer.emitter.on('mousedown', (e: LayerMouseEvent) => {
                    start(layer, e.x, e.y)
                })

                layer.emitter.on('mousemove', (e: LayerMouseEvent) => {
                    move(layer, e.x, e.y, 0.5)
                })

                layer.emitter.on('mouseup', () => end(layer))
                layer.emitter.on('mouseout', () => end(layer))
            })
        },
    })
}
