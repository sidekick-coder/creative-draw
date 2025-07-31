import type { ColorRGB } from '@/utils/colors'

export interface LayerPointEvent {
    event: PointerEvent
    x: number
    y: number
    pressure: number
    ctx: OffscreenCanvasRenderingContext2D
}

export interface LayerTouchEvent {
    event: TouchEvent
    x: number
    y: number
    pressure: number
    ctx: OffscreenCanvasRenderingContext2D
}

export interface LayerMouseEvent {
    event: MouseEvent
    x: number
    y: number
    ctx: OffscreenCanvasRenderingContext2D
}

interface Payload {
    id: string
    name: string
    visible: boolean
    order: number
    opacity: number
    background_color?: ColorRGB
    data: any[]
}

export function createLayer(payload: Partial<Payload> = {}) {
    const id = payload.id || createId()
    const emitter = createEmitter()
    const context = createContext({
        data: payload.data || [],
        name: payload.name || `New Layer`,
        order: payload.order || 0,
        visible: payload.visible !== undefined ? payload.visible : true,
        opacity: payload.opacity || 1,
        background_color: payload.background_color || undefined,
    })

    const name = context.createRef<string>(`name`)
    const visible = context.createRef<boolean>(`visible`)
    const order = context.createRef<number>(`order`)
    const opacity = context.createRef<number>(`opacity`)
    const backgroundColor = context.createRef<ColorRGB | undefined>(`background_color`)

    function get<T = any>(key: string, defaultValue?: T): T {
        const value = context.get(key) || defaultValue

        if (!value && defaultValue) {
            return defaultValue as T
        }

        if (!value) {
            throw new Error(`Context ${key} is not set`)
        }

        return value as T
    }

    function set<T = any>(key: string, value: T) {
        context.set(key, value)

        emitter.emit('set', { key, value })
    }

    function serialize() {
        const data = {
            id,
            name: name.value,
            visible: visible.value,
            order: order.value,
            opacity: opacity.value,
            background_color: backgroundColor.value,
            data: context.get('data') || [],
        }

        return JSON.parse(JSON.stringify(data))
    }

    return reactive({
        id,
        emitter,
        context,

        name,
        visible,
        order,
        opacity,
        backgroundColor,

        get,
        set,
        serialize,
    })
}
