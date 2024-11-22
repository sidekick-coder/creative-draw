import type { BrushOptions } from '~/utils/defineBrush'

export default defineBrush(() => {
    const state = {
        isDrawing: false,
        lastX: 0,
        lastY: 0,
    }

    return {
        name: 'pen',
        start({ position, ctx }: BrushOptions) {
            const { x, y } = position

            ctx.beginPath()
            ctx.moveTo(x, y)

            state.lastX = x
            state.lastY = y

            state.isDrawing = true
        },
        draw({ position, settings, ctx }: BrushOptions) {
            if (!state.isDrawing) return

            const { x, y } = position
            const { color, size } = settings

            console.log(color, size, position)

            ctx.strokeStyle = color
            ctx.lineWidth = size
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'

            ctx.lineTo(state.lastX, state.lastY)
            ctx.stroke()

            state.lastX = x
            state.lastY = y
        },
        stop({ ctx }: BrushOptions) {
            ctx.closePath()

            state.isDrawing = false
        },
    }
})
