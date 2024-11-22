import type { BrushOptions } from '~/utils/defineBrush'

export default defineBrush((ctx) => {
    let isDrawing = false

    function start({ position }: BrushOptions) {
        const { x, y } = position

        isDrawing = true

        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    function draw({ position, settings }: BrushOptions) {
        if (!isDrawing) return

        const { x, y } = position
        const { color, size } = settings

        ctx.strokeStyle = color
        ctx.lineWidth = size
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.lineTo(x, y)
        ctx.stroke()
    }

    function stop() {
        isDrawing = false
        ctx.closePath()
    }

    return { start, draw, stop }
})
