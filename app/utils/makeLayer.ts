export function makeLayer(payload: Partial<ProjectDataLayer>): ProjectDataLayer {
    const canvas = payload.canvas || document.createElement('canvas')

    return {
        id: createId(),
        name: 'Layer',
        type: 'paint',
        opacity: 1,
        visible: true,
        order: 1,
        width: canvas.width,
        height: canvas.height,
        canvas,
        ...payload,
    }
}
