export interface ObjectRenderOptions<T extends LayerObject = LayerObject> {
    ctx: CanvasRenderingContext2D
    item: T
    layer: Layer
}

export interface ObjectRender<T extends LayerObject = LayerObject> {
    name: string
    render: (options: ObjectRenderOptions<T>) => void
}

export function defineObjectRender<T extends LayerObject = LayerObject>(render: ObjectRender<T>) {
    return render
}
