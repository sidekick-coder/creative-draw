export interface ProjectBase {
    id: string
    name?: string
}

export interface ProjectDataLayer {
    id: string
    name: string
    type: 'paint'
    order: number
    points: DrawBrushResultPoint[]
    width: number
    height: number
    visible: boolean
    opacity: number
}

export interface ProjectData {
    name?: string
    thumbnail?: string
    width: number
    height: number
    layers: ProjectDataLayer[]
}

export interface ProjectDataWithIdAndType extends ProjectData {
    id: string
    type: 'filesystem' | 'indexeddb'
}
