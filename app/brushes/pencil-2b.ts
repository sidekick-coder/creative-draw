export default defineBrush({
    id: 'pencil-2b',
    name: 'Pencil 2B',
    size: 10,
    opacity: 0.8,
    jitter: 0.05,
    pressure: {
        size: false,
        opacity: true,
    },
    grain: {
        density: 1,
        size: 0.5,
        opacity: 0.7,
        jitter: 0.15,
    },
})
