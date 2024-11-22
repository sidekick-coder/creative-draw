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

            const { x, y } = position
            const { color, size } = settings

            const opacity = (settings.opacity || 1) * pressure
            const hardness = (settings.hardness || 1) * pressure

            ctx.globalAlpha = opacity
            ctx.strokeStyle = settings.color
            ctx.lineWidth = size
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'

            if (hardness < 1) {
                const gradient = ctx.createRadialGradient(x, y, size * (1 - hardness), x, y, size)

                gradient.addColorStop(0, color)
                gradient.addColorStop(1, `rgba(0, 0, 0, ${opacity})`)
                ctx.strokeStyle = gradient
            }

            ctx.lineTo(state.lastX, state.lastY)
            ctx.stroke()

            state.lastX = x
            state.lastY = y
        },
        stop({ ctx }) {
            ctx.closePath()

            state.isDrawing = false
        },
    }
})
