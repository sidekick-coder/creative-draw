export default defineBrush(() => {
    const state = {
        isDrawing: false,
        lastX: 0,
        lastY: 0,
    }

    return {
        name: 'pen',
        start({ position }) {
            const { x, y } = position

            state.lastX = x
            state.lastY = y

            state.isDrawing = true
        },
        draw({ position, settings, ctx }) {
            if (!state.isDrawing) return

            const { size, opacity, color } = settings

            const startX = state.lastX
            const startY = state.lastY

            const endX = position.x
            const endY = position.y

            const gap = 0.1

            const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)
            const steps = Math.floor(distance / gap)
            const map = new Map<string, { x: number; y: number }>()

            for (let i = 0; i < steps; i++) {
                const t = i / steps
                const x = startX + t * (endX - startX)
                const y = startY + t * (endY - startY)

                const key = `${Math.round(x)}-${Math.round(y)}`

                map.set(key, { x, y })
            }

            ctx.save()

            ctx.globalAlpha = opacity
            ctx.strokeStyle = `rgba(${color}, ${opacity})`
            ctx.lineWidth = size
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'

            const points = Array.from(map.values())

            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i]!
                const p2 = points[i + 1]!

                if (!p1 || !p2) continue

                ctx.beginPath()
                ctx.moveTo(p1.x, p1.y)
                ctx.lineTo(p2.x, p2.y)
                ctx.stroke()
                ctx.closePath()
            }

            ctx.restore()

            state.lastX = position.x
            state.lastY = position.y
        },
        stop() {
            state.isDrawing = false
        },
    }
})
