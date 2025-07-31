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
    let device = 'mouse' // Default to mouse, can be changed based on input type
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

    function move(layer: Layer, x: number, y: number, pressure = 0.5) {
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
                    move(layer, e.x, e.y)
                })

                layer.emitter.on('mouseup', () => end(layer))
                layer.emitter.on('mouseout', () => end(layer))

                // pointer events / pen events
                layer.emitter.on('pointerdown', (e: LayerPointEvent) => {
                    if (e.event.pointerType !== 'pen') return

                    device = 'pointer'
                    start(layer, e.x, e.y)
                })

                layer.emitter.on('pointermove', (e: LayerPointEvent) => {
                    if (device !== 'pointer') return
                    move(layer, e.x, e.y, e.pressure)
                })

                layer.emitter.on('pointerup', () => {
                    if (device !== 'pointer') return

                    end(layer)
                })

                layer.emitter.on('pointerout', () => {
                    if (device !== 'pointer') return

                    end(layer)
                })

                // touch events
                layer.emitter.on('touchstart', (e: LayerTouchEvent) => {
                    e.event.preventDefault()

                    if (e.event.touches.length !== 1) return
                    device = 'touch'

                    start(layer, e.x, e.y)
                })

                layer.emitter.on('touchmove', (e: LayerTouchEvent) => {
                    if (device !== 'touch') return
                    if (e.event.touches.length !== 1) return

                    move(layer, e.x, e.y)
                })

                layer.emitter.on('touchend', (e: LayerTouchEvent) => {
                    if (device !== 'touch') return

                    end(layer)
                })
            })
        },
    })
}
