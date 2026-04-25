import type { Board } from './createBoard'
import type { Layer } from './useLayer'
import type { LayerMouseEvent } from './createLayer'
import type { ColorRGB } from '@/utils/colors'
import type { BrushDefinition } from './defineBrush'

export interface CreateBrushOptions {
    size?: MaybeRef<number>
    opacity?: MaybeRef<number>
    color?: MaybeRef<ColorRGB>
    erase?: MaybeRef<boolean>
    definition?: MaybeRef<BrushDefinition | undefined>
}

export function createBrush(options?: CreateBrushOptions) {
    const size = toRef(options?.size ?? 1)
    const opacity = toRef(options?.opacity ?? 1)
    const color = toRef(options?.color ?? { r: 0, g: 0, b: 0 })
    const erase = toRef(options?.erase ?? false)
    const definition = toRef(options?.definition)

    let drawing = false
    let device = null as 'mouse' | 'pointer' | 'touch' | null
    let lastX = 0
    let lastY = 0
    let lastPressure = 0
    let paths = [] as BrushPath[]

    function start(layer: Layer, x: number, y: number, pressure = 0.5) {
        drawing = true
        lastX = x
        lastY = y
        lastPressure = pressure
        paths = []
        const drawPath =
            definition.value?.draw({
                x: x + 1,
                y: y + 1,
                lastX,
                lastY,
                lastPressure,
                pressure,
                size: size.value,
                opacity: opacity.value,
                color: color.value,
            }) ?? []

        drawPath.forEach((path) => {
            path.erase = erase.value
            paths.push(path)
        })

        layer.emitter.emit('paths:begin', {
            opacity: opacity.value,
        })
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

        const newPaths = definition.value?.draw(payload) ?? []

        newPaths.forEach((path) => {
            paths.push({
                ...path,
                erase: erase.value,
            })
        })

        lastX = x
        lastY = y
        lastPressure = pressure
        layer.emitter.emit('paths:draw', paths)
    }

    function end(layer: Layer) {
        drawing = false

        const item = {
            id: createId(),
            type: 'stroke',
            paths,
            opacity: opacity.value,
        }

        layer.add(item)

        paths = []

        layer.emitter.emit('stroke', item)

        layer.emitter.emit('paths:end')

        device = null
    }

    return defineBoardPlugin(
        reactive({
            erase,
            size,
            opacity,
            color,
            install(board: Board) {
                board.emitter.on('layer:add', (layer: Layer) => {
                    console.log('[brush] installing on layer', layer.id)

                    function endIfIsDevice(checkDevice: 'mouse' | 'pointer' | 'touch') {
                        if (device === checkDevice) {
                            end(layer)
                        }
                    }

                    // testing lines
                    // setTimeout(() => {
                    //     console.log('testing brush')
                    //     start(layer, 100, 100)
                    //
                    //     move(layer, 500, 500, 0.1)
                    //
                    //     move(layer, 800, 800, 0.8)
                    //
                    //     end(layer)
                    // }, 1000)

                    layer.emitter.on('mousedown', (e: LayerMouseEvent) => {
                        if (device) return

                        device = 'mouse'

                        start(layer, e.x, e.y)
                    })

                    layer.emitter.on('mousemove', (e: LayerMouseEvent) => {
                        if (device !== 'mouse') return

                        move(layer, e.x, e.y)
                    })

                    layer.emitter.on('mouseup', () => endIfIsDevice('mouse'))
                    layer.emitter.on('mouseout', () => endIfIsDevice('mouse'))

                    // pointer events / pen events
                    let activePointerId: number | null = null

                    layer.emitter.on('pointerdown', (e: LayerPointEvent) => {
                        if (device) return

                        if (e.event.pointerType !== 'pen') return

                        device = 'pointer'
                        activePointerId = e.event.pointerId

                        start(layer, e.x, e.y, e.pressure)
                    })

                    layer.emitter.on('pointermove', (e: LayerPointEvent) => {
                        if (device !== 'pointer') return

                        if (e.event.pointerId !== activePointerId) return

                        move(layer, e.x, e.y, e.pressure)
                    })

                    layer.emitter.on('pointerup', (e) => {
                        if (e.event.pointerId !== activePointerId) return

                        endIfIsDevice('pointer')
                    })

                    layer.emitter.on('pointercancel', (e) => {
                        if (e.event.pointerId !== activePointerId) return

                        endIfIsDevice('pointer')
                    })

                    layer.emitter.on('lostpointercapture', (e) => {
                        if (e.event.pointerId !== activePointerId) return

                        endIfIsDevice('pointer')
                    })

                    // touch events
                    layer.emitter.on('touchstart', (e: LayerTouchEvent) => {
                        if (device) return

                        e.event.preventDefault()

                        if (e.event.touches.length !== 1) return
                        device = 'touch'

                        start(layer, e.x, e.y)
                    })

                    layer.emitter.on('touchmove', (e: LayerTouchEvent) => {
                        if (device !== 'touch') return
                        if (e.event.touches.length !== 1) return

                        move(layer, e.x, e.y, e.pressure)
                    })

                    layer.emitter.on('touchend', () => endIfIsDevice('touch'))
                })
            },
        })
    )
}
