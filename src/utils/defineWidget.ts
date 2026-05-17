export interface WidgetDefinition {
    id: string
    component: ReturnType<typeof defineAsyncComponent>
}

export interface WidgetData {
    widget_id: string
    x: number
    y: number
    width: number
    height: number
}

export function defineWidget(definition: WidgetDefinition): WidgetDefinition {
    return definition
}
