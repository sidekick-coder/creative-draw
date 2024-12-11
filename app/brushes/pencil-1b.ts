export default defineBrush({
    id: 'pencil-b',
    name: 'Pencil B',
    size: 9,
    opacity: 0.7,
    jitter: 0.05,
    pressure: {
        size: false,
        opacity: true,
    },
    grain: {
        density: 1,
        size: 0.5,
        opacity: 0.7,
        jitter: 0.1,
    },
})
