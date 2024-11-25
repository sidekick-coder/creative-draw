import { es2015 } from 'globals'

export default defineBrush(() => {
    const state = {
        isDrawing: false,
        lastX: 0,
        lastY: 0,
        lastPressure: 0,
    }

    return {
        name: 'brush',
        start({ position }) {
            const { x, y } = position

            state.lastX = x
            state.lastY = y

            state.isDrawing = true
        },
        draw({ position, settings, ctx, pressure = 1 }) {
            if (!state.isDrawing) return

            const startX = state.lastX
            const startY = state.lastY
            const startPressure = state.lastPressure

            const endX = position.x
            const endY = position.y
            const endPressure = pressure

            const gap = 0.1

            const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)
            const steps = Math.floor(distance / gap)
            const points = [] as any

            for (let i = 0; i < steps; i++) {
                const t = i / steps
                const x = startX + t * (endX - startX)
                const y = startY + t * (endY - startY)
                const pressure = startPressure + t * (endPressure - startPressure)

                points.push({ x, y, pressure })
            }

            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i]
                const p2 = points[i + 1]

                const size = settings.size
                const opacity = (settings.opacity || 1) * p1.pressure

                ctx.globalAlpha = opacity
                ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`
                ctx.lineWidth = size
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'

                ctx.beginPath()
                ctx.moveTo(p1.x, p1.y)
                ctx.lineTo(p2.x, p2.y)
                ctx.stroke()
                ctx.closePath()
            }

            state.lastX = position.x
            state.lastY = position.y
            state.lastPressure = pressure
        },
        stop() {
            state.isDrawing = false
        },
    }
})
