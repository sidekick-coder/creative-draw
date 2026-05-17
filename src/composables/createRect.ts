import type { Board } from './createBoard'
import type { Layer } from './useLayer'
import type { LayerMouseEvent } from './createLayer'
import type { ColorRGB } from '@/utils/colors'
import { defineObjectRender } from './defineObjectRender'

interface CreateRectOptions {
    active?: MaybeRef<boolean>
    color?: MaybeRef<ColorRGB>
    size?: MaybeRef<number>
    opacity?: MaybeRef<number>
    debug?: boolean
}

const render = defineObjectRender({
    name: 'rect',
    render({ ctx, item }) {
        ctx.globalAlpha = item.opacity ?? 1
        ctx.strokeStyle = `rgb(${item.color.r}, ${item.color.g}, ${item.color.b})`
        ctx.lineWidth = item.strokeWidth ?? 2
        ctx.strokeRect(item.x, item.y, item.width, item.height)
        ctx.globalAlpha = 1
    },
})

export function createRect(options: CreateRectOptions = {}) {
    const active = toRef(options.active ?? false)
    const color = toRef(options.color ?? { r: 0, g: 0, b: 0 })
    const size = toRef(options.size ?? 2)
    const opacity = toRef(options.opacity ?? 1)

    let drawing = false
    let startX = 0
    let startY = 0
    let savedImageData: ImageData | null = null

    function drawPreview(ctx: OffscreenCanvasRenderingContext2D, x: number, y: number) {
        if (savedImageData) ctx.putImageData(savedImageData, 0, 0)

        ctx.globalAlpha = opacity.value
        ctx.strokeStyle = `rgb(${color.value.r}, ${color.value.g}, ${color.value.b})`
        ctx.lineWidth = size.value
        ctx.strokeRect(startX, startY, x - startX, y - startY)
        ctx.globalAlpha = 1
    }

    function cancel(ctx: OffscreenCanvasRenderingContext2D) {
        if (savedImageData) {
            ctx.putImageData(savedImageData, 0, 0)
            savedImageData = null
        }

        drawing = false
    }

    return defineBoardPlugin(
        reactive({
            active,
            render,
            install(board: Board) {
                board.emitter.on('layer:add', (layer: Layer) => {
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
                            type: 'rect',
                            x,
                            y,
                            width,
                            height,
                            color: { ...color.value },
                            strokeWidth: size.value,
                            opacity: opacity.value,
                        }

                        e.ctx.globalAlpha = item.opacity
                        e.ctx.strokeStyle = `rgb(${item.color.r}, ${item.color.g}, ${item.color.b})`
                        e.ctx.lineWidth = item.strokeWidth
                        e.ctx.strokeRect(item.x, item.y, item.width, item.height)
                        e.ctx.globalAlpha = 1

                        layer.add(item)
                    })

                    layer.emitter.on('mouseout', (e: LayerMouseEvent) => {
                        if (!drawing) return

                        cancel(e.ctx)
                    })
                })
            },
        })
    )
}
