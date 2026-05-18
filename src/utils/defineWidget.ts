export interface WidgetDefinition {
    id: string
    component: ReturnType<typeof defineAsyncComponent>
    icon?: string
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
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
