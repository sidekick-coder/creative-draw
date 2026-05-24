import type { Board } from './createBoard'
import type { Layer } from './useLayer'
import type { LayerMouseEvent } from './createLayer'
import { defineObjectRender } from './defineObjectRender'

interface CreateToolEllipseOptions {
    board: Board
    active?: MaybeRef<boolean>
    debug?: boolean
}

export function useEllipseToolOptions(board: Board) {
    const size = board.context.ref('tools:ellipse:size', 10)
    const opacity = board.context.ref('tools:shared:opacity', 1)
    const color = board.context.ref('tools:shared:color', { r: 0, g: 0, b: 0 })
    const fill = board.context.ref('tools:ellipse:fill', false)

    return {
        size,
        opacity,
        color,
        fill,
    }
}

interface DrawEllipseOptions {
    ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
    x: number
    y: number
    w: number
    h: number
    size: number
    opacity: number
    color: { r: number; g: number; b: number }
}

function drawEllipse(options: DrawEllipseOptions) {
    const { ctx, x, y, w, h, size, opacity, color } = options

    ctx.globalAlpha = opacity
    ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
    ctx.lineWidth = size

    ctx.beginPath()
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = 1
}

const render = defineObjectRender({
    name: 'ellipse',
    render({ ctx, item }) {
        drawEllipse({
            ctx,
            x: item.x,
            y: item.y,
            w: item.width,
            h: item.height,
            size: item.strokeWidth ?? 10,
            opacity: item.opacity ?? 1,
            color: item.color,
        })
    },
})

export function createToolEllipse(options: CreateToolEllipseOptions) {
    const active = toRef(options.active ?? false)

    const { size, opacity, color, fill } = useRectOptions(options.board)

    let drawing = false
    let startX = 0
    let startY = 0
    let savedImageData: ImageData | null = null

    function drawPreview(ctx: OffscreenCanvasRenderingContext2D, x: number, y: number) {
        if (savedImageData) ctx.putImageData(savedImageData, 0, 0)

        drawEllipse({
            ctx,
            x: Math.min(startX, x),
            y: Math.min(startY, y),
            w: Math.abs(x - startX),
            h: Math.abs(y - startY),
            size: size.value,
            opacity: opacity.value,
            color: color.value,
            isFill: fill.value,
        })
    }

    function cancel(ctx: OffscreenCanvasRenderingContext2D) {
        if (savedImageData) {
            ctx.putImageData(savedImageData, 0, 0)
            savedImageData = null
        }

        drawing = false
    }

    return defineBoardPlugin({
        active,
        fill,
        render,
        install(board: Board) {
            board.renders.set('ellipse', render)

            board.emitter.on('layer:added', (layer: Layer) => {
                layer.emitter.on('mousedown', (e: LayerMouseEvent) => {
                    if (!active.value) return

                    drawing = true
                    startX = e.x
                    startY = e.y
                    savedImageData = e.ctx.getImageData(
                        0,
                        0,
                        e.ctx.canvas.width,
                        e.ctx.canvas.height
                    )
                })

                layer.emitter.on('mousemove', (e: LayerMouseEvent) => {
                    if (!active.value || !drawing) return

                    drawPreview(e.ctx, e.x, e.y)
                })

                layer.emitter.on('mouseup', (e: LayerMouseEvent) => {
                    if (!active.value || !drawing) return

                    cancel(e.ctx)

                    const x = Math.min(startX, e.x)
                    const y = Math.min(startY, e.y)
                    const width = Math.abs(e.x - startX)
                    const height = Math.abs(e.y - startY)

                    if (width < 1 || height < 1) return

                    const item = {
                        id: createId(),
                        type: 'ellipse',
                        x,
                        y,
                        width,
                        height,
                        color: { ...color.value },
                        strokeWidth: size.value,
                        opacity: opacity.value,
                        fill: fill.value,
                    }

                    drawEllipse({
                        ctx: e.ctx,
                        x,
                        y,
                        w: width,
                        h: height,
                        size: size.value,
                        opacity: opacity.value,
                        color: color.value,
                        isFill: fill.value,
                    })

                    layer.add(item)
                })

                layer.emitter.on('mouseout', (e: LayerMouseEvent) => {
                    if (!drawing) return

                    cancel(e.ctx)
                })
            })
        },
    })
}
