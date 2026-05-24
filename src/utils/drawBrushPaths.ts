function createPathKey(x: number, y: number, pressure: number, size: number, color: ColorRGB) {
    return `${Math.round(x)}-${Math.round(y)}-${pressure.toFixed(2)}-${size.toFixed(2)}-${color.r}-${color.g}-${color.b}`
}

export function drawBrushPath(
    ctx: CanvasRenderingContext2D,
    paths: BrushPath[],
    color: ColorRGB = { r: 0, g: 0, b: 0 },
    exclude = new Set<string>()
) {
    paths.forEach((p) => {
        const key = createPathKey(p.x, p.y, p.pressure, p.size, color)

        if (exclude.has(key)) {
            return
        }

        exclude.add(key)

        const opacity = p.opacity || 1

        if (p.erase) {
            ctx.globalCompositeOperation = 'destination-out'
            ctx.globalAlpha = opacity
            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
            ctx.fill()
            ctx.closePath()
            ctx.globalCompositeOperation = 'source-over'
            return
        }

        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = opacity
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    })
}
