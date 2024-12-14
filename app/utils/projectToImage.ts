import type { ProjectData } from '~/repositories/projectRepository'

interface Options {
    type: 'png' | 'jpeg'
    project: ProjectData
    responseType: 'blob' | 'arrayBuffer' | 'base64'
}

export async function projectToImage({ project, type, responseType }: Options) {
    const { width, height, layers } = project

    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')!

    layers
        .slice()
        .reverse()
        .filter((layer) => layer.visible)
        .forEach((layer) => {
            ctx.drawImage(layer.data, 0, 0)
        })

    if (responseType === 'base64') {
        const blob = await canvas.convertToBlob({ type: `image/${type}` })

        return blobToBase64(blob)
    }

    return await canvas.convertToBlob({ type: `image/${type}` })
}
