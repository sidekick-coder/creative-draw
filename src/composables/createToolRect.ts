import type { Board } from './createBoard'
import type { Layer } from './useLayer'
import type { LayerMouseEvent, LayerPointEvent, LayerTouchEvent } from './createLayer'
import { defineObjectRender } from './defineObjectRender'

interface CreateRectOptions {
    board: Board
    active?: MaybeRef<boolean>
    debug?: boolean
}

export function useRectOptions(board: Board) {
    const size = board.context.ref('tools:shared:size', 10)
    const opacity = board.context.ref('tools:shared:opacity', 1)
    const color = board.context.ref('tools:shared:color', { r: 0, g: 0, b: 0 })
    const fill = board.context.ref('tools:rect:fill', false)
    const constrain = board.context.ref('tools:shared:shape-constrain', false)

    return {
        size,
        opacity,
        color,
        fill,
        constrain,
    }
}
const render = defineObjectRender({
    name: 'rect',
    render({ ctx, item }) {
        ctx.globalAlpha = item.opacity ?? 1
        ctx.strokeStyle = `rgb(${item.color.r}, ${item.color.g}, ${item.color.b})`
        ctx.fillStyle = `rgb(${item.color.r}, ${item.color.g}, ${item.color.b})`
        ctx.lineWidth = item.strokeWidth ?? 2

        if (item.fill) {
            ctx.fillRect(item.x, item.y, item.width, item.height)
        } else {
            ctx.strokeRect(item.x, item.y, item.width, item.height)
        }

        ctx.globalAlpha = 1
    },
})

export function createToolRect(options: CreateRectOptions) {
    const active = toRef(options.active ?? false)

    const { size, opacity, color, fill, constrain } = useRectOptions(options.board)

    let drawing = false
    let startX = 0
    let startY = 0

    let overlayCanvas: HTMLCanvasElement | null = null
    let overlayCtx: CanvasRenderingContext2D | null = null

    function ensureOverlay(board: Board) {
        if (overlayCanvas) return

        const container = board.context.get<HTMLElement>('container')

        overlayCanvas = document.createElement('canvas')
        overlayCanvas.style.position = 'absolute'
        overlayCanvas.style.pointerEvents = 'none'
        overlayCanvas.style.zIndex = '9999'
        overlayCanvas.style.display = 'none'

        container.appendChild(overlayCanvas)

        overlayCtx = overlayCanvas.getContext('2d')!
    }

    function syncOverlay(layerCanvas: HTMLCanvasElement) {
        if (!overlayCanvas) return

        overlayCanvas.width = layerCanvas.width
        overlayCanvas.height = layerCanvas.height
        overlayCanvas.style.left = layerCanvas.style.left
        overlayCanvas.style.top = layerCanvas.style.top
    }

    function drawRect(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        isFill: boolean
    ) {
        ctx.globalAlpha = opacity.value
        ctx.strokeStyle = `rgb(${color.value.r}, ${color.value.g}, ${color.value.b})`
        ctx.fillStyle = `rgb(${color.value.r}, ${color.value.g}, ${color.value.b})`
        ctx.lineWidth = size.value

        if (isFill) {
            ctx.fillRect(x, y, w, h)
        } else {
            ctx.strokeRect(x, y, w, h)
        }

        ctx.globalAlpha = 1
    }

    function getDrawCoords(mouseX: number, mouseY: number, constrain: boolean) {
        let dx = mouseX - startX
        let dy = mouseY - startY

        if (constrain) {
            const side = Math.min(Math.abs(dx), Math.abs(dy))
            dx = side * Math.sign(dx)
            dy = side * Math.sign(dy)
        }

        return { dx, dy }
    }

    function drawPreview(x: number, y: number, constrain: boolean) {
        if (!overlayCtx || !overlayCanvas) return

        const { dx, dy } = getDrawCoords(x, y, constrain)

        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
        drawRect(overlayCtx, startX, startY, dx, dy, fill.value)
    }
    function cancel() {
        if (overlayCtx && overlayCanvas) {
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
            overlayCanvas.style.display = 'none'
        }

        drawing = false
    }

    let device: 'mouse' | 'pointer' | 'touch' | null = null
    let activePointerId: number | null = null

    return defineBoardPlugin({
        active,
        fill,
        constrain,
        render,
        install(board: Board) {
            board.renders.set('rect', render)

            board.emitter.on('layer:added', (layer: Layer) => {
                function startDrawing(layerCanvas: HTMLCanvasElement, x: number, y: number) {
                    ensureOverlay(board)
                    syncOverlay(layerCanvas)
                    drawing = true
                    startX = x
                    startY = y
                    if (overlayCanvas) overlayCanvas.style.display = 'block'
                }

                function commitRect(
                    ctx: OffscreenCanvasRenderingContext2D,
                    x: number,
                    y: number,
                    shiftKey: boolean
                ) {
                    cancel()

                    const { dx, dy } = getDrawCoords(x, y, constrain.value || shiftKey)
                    const rx = Math.min(startX, startX + dx)
                    const ry = Math.min(startY, startY + dy)
                    const width = Math.abs(dx)
                    const height = Math.abs(dy)

                    if (width < 1 || height < 1) return

                    const item = {
                        id: createId(),
                        type: 'rect',
                        x: rx,
                        y: ry,
                        width,
                        height,
                        color: { ...color.value },
                        strokeWidth: size.value,
                        opacity: opacity.value,
                        fill: fill.value,
                    }

                    drawRect(ctx, item.x, item.y, item.width, item.height, item.fill)
                    layer.add(item)
                }

                function endIfDevice(
                    checkDevice: 'mouse' | 'pointer' | 'touch',
                    ctx: OffscreenCanvasRenderingContext2D,
                    x: number,
                    y: number,
                    shiftKey: boolean
                ) {
                    if (device !== checkDevice || !drawing) return
                    commitRect(ctx, x, y, shiftKey)
                    device = null
                }

                // mouse
                layer.emitter.on('mousedown', (e: LayerMouseEvent) => {
                    if (!active.value || device) return
                    device = 'mouse'
                    startDrawing(e.ctx.canvas as unknown as HTMLCanvasElement, e.x, e.y)
                })

                layer.emitter.on('mousemove', (e: LayerMouseEvent) => {
                    if (!active.value || device !== 'mouse') return
                    drawPreview(e.x, e.y, constrain.value || e.event.shiftKey)
                })

                layer.emitter.on('mouseup', (e: LayerMouseEvent) => {
                    endIfDevice('mouse', e.ctx, e.x, e.y, e.event.shiftKey)
                })

                layer.emitter.on('mouseout', (e: LayerMouseEvent) => {
                    if (device !== 'mouse' || !drawing) return
                    cancel()
                    device = null
                })

                // pen
                layer.emitter.on('pointerdown', (e: LayerPointEvent) => {
                    if (!active.value || device) return
                    if (e.event.pointerType !== 'pen') return
                    device = 'pointer'
                    activePointerId = e.event.pointerId
                    startDrawing(e.ctx.canvas as unknown as HTMLCanvasElement, e.x, e.y)
                })

                layer.emitter.on('pointermove', (e: LayerPointEvent) => {
                    if (!active.value || device !== 'pointer') return
                    if (e.event.pointerId !== activePointerId) return
                    drawPreview(e.x, e.y, constrain.value || e.event.shiftKey)
                })

                layer.emitter.on('pointerup', (e: LayerPointEvent) => {
                    if (e.event.pointerId !== activePointerId) return
                    endIfDevice('pointer', e.ctx, e.x, e.y, e.event.shiftKey)
                    activePointerId = null
                })

                layer.emitter.on('pointercancel', (e: LayerPointEvent) => {
                    if (e.event.pointerId !== activePointerId) return
                    cancel()
                    device = null
                    activePointerId = null
                })

                layer.emitter.on('lostpointercapture', (e: LayerPointEvent) => {
                    if (e.event.pointerId !== activePointerId) return
                    cancel()
                    device = null
                    activePointerId = null
                })

                // touch
                layer.emitter.on('touchstart', (e: LayerTouchEvent) => {
                    if (!active.value || device) return
                    if (e.event.touches.length !== 1) return
                    e.event.preventDefault()
                    device = 'touch'
                    startDrawing(e.ctx.canvas as unknown as HTMLCanvasElement, e.x, e.y)
                })

                layer.emitter.on('touchmove', (e: LayerTouchEvent) => {
                    if (!active.value || device !== 'touch') return
                    if (e.event.touches.length !== 1) return
                    drawPreview(e.x, e.y, constrain.value)
                })

                layer.emitter.on('touchend', (e: LayerTouchEvent) => {
                    endIfDevice('touch', e.ctx, e.x, e.y, false)
                })
            })
        },
    })
}
