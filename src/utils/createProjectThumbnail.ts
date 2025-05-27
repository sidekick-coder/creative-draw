export function createBlob(width: number, height: number, layers: any[] = []) {
    return new Promise<Blob>((resolve, reject) => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')!

        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        for (const l of layers) {
            l.data.forEach((o: any) => {
                o.paths.forEach((p: any) => {
                    ctx.fillStyle = p.color
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                    ctx.fill()
                })
            })
        }

        canvas.toBlob((blob) => {
            if (blob) {
                return resolve(blob)
            }

            reject(new Error('Failed to create thumbnail'))
        }, 'image/png')
    })
}

export async function createProjectThumbnail(width: number, height: number, layers: any[]) {
    const blob = await createBlob(width, height, layers)

    return new Promise<string>((resolve) => {
        const reader = new FileReader()

        reader.onload = () => {
            resolve(reader.result as string)
        }

        reader.readAsDataURL(blob)
    })
}
