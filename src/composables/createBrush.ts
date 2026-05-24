import type { Board } from './createBoard'
import type { Layer } from './useLayer'
import type { LayerMouseEvent } from './createLayer'
import type { ColorRGB } from '@/utils/colors'
import type { BrushDefinition } from './defineBrush'
import { defineObjectRender } from './defineObjectRender'
import { drawBrushPath } from '@/utils/drawBrushPaths'

export interface CreateBrushOptions {
    board: Board
    size?: MaybeRef<number>
    opacity?: MaybeRef<number>
    color?: MaybeRef<ColorRGB>
    erase?: MaybeRef<boolean>
    definition?: MaybeRef<BrushDefinition | undefined>
    active?: MaybeRef<boolean>
}

export function useBrushOptions(board: Board) {
    const definitionId = board.context.ref<string | null>('tools:brush:definition-id', 'cd01')
    const size = board.context.ref('tools:brush:size', 10)
    const opacity = board.context.ref('tools:brush:opacity', 1)
    const color = board.context.ref('tools:brush:color', { r: 0, g: 0, b: 0 })
    const erase = board.context.ref('tools:brush:erase', false)

    return {
        definitionId,
        size,
        opacity,
        color,
        erase,
    }
}

const layerExcludeMap = new Map<string, Set<string>>()

const render = defineObjectRender({
    name: 'stroke',
    render({ ctx, item }) {
        drawBrushPath(ctx, item.paths, item.color)
    },
})

export function createBrush(options: CreateBrushOptions) {
    const board = options.board
    const availableBrushes = useBrushes()

    const { size, opacity, color, erase, definitionId } = useBrushOptions(board)

    const definition = computed(() => availableBrushes.find((b) => b.id === definitionId.value))

    const active = toRef(options?.active ?? true)

    let drawing = false
    let device = null as 'mouse' | 'pointer' | 'touch' | null
    let lastX = 0
    let lastY = 0
    let lastPressure = 0
    let paths = [] as BrushPath[]

    function start(layer: Layer, x: number, y: number, pressure = 0.5) {
        if (!active.value) return
        if (!definition.value) return

        drawing = true
        lastX = x
        lastY = y
        lastPressure = pressure
        paths = []

        const drawPath = definition.value.draw({
            x: x + 1,
            y: y + 1,
            lastX,
            lastY,
            lastPressure,
            pressure,
            size: size.value,
            opacity: opacity.value,
            color: color.value,
        })

        drawPath.forEach((path) => {
            path.erase = erase.value
            paths.push(path)
        })

        const ctx = layer.context.get('context')
        const exclude = layerExcludeMap.get(layer.id) || new Set<string>()

        exclude.clear()

        drawBrushPath(ctx, paths, color.value, exclude)
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

        const ctx = layer.context.get('context')
        const exclude = layerExcludeMap.get(layer.id) || new Set<string>()

        drawBrushPath(ctx, newPaths, color.value, exclude)
    }

    function end(layer: Layer) {
        if (!drawing) return

        drawing = false

        const item = {
            id: createId(),
            type: 'stroke',
            color: color.value,
            paths,
        }

        layer.add(item)

        paths = []

        const ctx = layer.context.get('context')
        const exclude = layerExcludeMap.get(layer.id) || new Set<string>()

        drawBrushPath(ctx, paths, color.value, exclude)

        exclude.clear()

        device = null
    }

    return defineBoardPlugin(
        reactive({
            erase,
            size,
            opacity,
            color,
            active,
            render,
            install(board: Board) {
                board.emitter.on('layer:added', (layer: Layer) => {
                    layerExcludeMap.set(layer.id, new Set<string>())

                    console.log('[brush] installing on layer', layer.id)

                    function endIfIsDevice(checkDevice: 'mouse' | 'pointer' | 'touch') {
                        if (device === checkDevice) {
                            end(layer)
                        }
                    }

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
