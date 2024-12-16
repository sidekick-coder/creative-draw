export async function uint8ToBlob(buffer: Uint8Array, width: number, height: number) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    canvas.width = width
    canvas.height = height

    const imageData = new ImageData(new Uint8ClampedArray(buffer), width, height)

    ctx.putImageData(imageData, 0, 0)

    const dataUrl = canvas.toDataURL('image/png')

    const blob = await fetch(dataUrl).then((res) => res.blob())

    return blob
}
