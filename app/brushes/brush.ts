export default defineBrush(() => {
    const state = {
        isDrawing: false,
        lastX: 0,
        lastY: 0,
    }

    return {
        name: 'brush',
        start({ position, ctx }) {
            const { x, y } = position

            ctx.beginPath()
            ctx.moveTo(x, y)

            state.lastX = x
            state.lastY = y

            state.isDrawing = true
        },
        draw({ position, settings, ctx, pressure = 1 }) {
            if (!state.isDrawing) return

            const size = settings.size * pressure

            ctx.globalAlpha = settings.opacity || 1
            ctx.strokeStyle = settings.color || 'black'
            ctx.lineWidth = size
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'

            ctx.beginPath()
            ctx.moveTo(state.lastX, state.lastY)
            ctx.lineTo(position.x, position.y)
            ctx.stroke()
            ctx.closePath()

            state.lastX = position.x
            state.lastY = position.y
        },
        stop() {
            state.isDrawing = false
        },
    }
})
