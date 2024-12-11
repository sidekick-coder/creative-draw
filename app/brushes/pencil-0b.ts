export default defineBrush({
    id: 'pencil-hb',
    name: 'Pencil HB',
    size: 8,
    opacity: 0.6,
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
