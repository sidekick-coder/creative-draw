export interface ObjectRenderOptions {
    ctx: CanvasRenderingContext2D
    item: LayerObject
    layer: Layer
}

export interface ObjectRender {
    name: string
    render: (options: ObjectRenderOptions) => void
}

export function defineObjectRender(render: ObjectRender) {
    return render
}
