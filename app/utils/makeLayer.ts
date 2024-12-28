export function makeLayer(payload: Partial<ProjectDataLayer>): ProjectDataLayer {
    return {
        id: createId(),
        name: 'Layer',
        type: 'paint',
        opacity: 1,
        visible: true,
        order: 1,
        width: 500,
        height: 500,
        points: [],
        ...payload,
    }
}
