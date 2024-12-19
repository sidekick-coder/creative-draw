interface Options {
    width: Ref<number>
    height: Ref<number>
    containerWidth: Ref<number>
    containerHeight: Ref<number>
}

export function createToolZoomAndPan({ width, height, containerWidth, containerHeight }: Options) {
    // position & scale
    const position = ref({ x: 0, y: 0 })
    const scale = ref(1)

    function setPosition(value: { x: number; y: number }) {
        position.value = value
    }

    function setScale(value: number) {
        const max = 4
        const min = 0.1

        let newValue = value

        newValue = Math.max(min, Math.min(max, newValue))

        scale.value = newValue
    }

    function centralize() {
        const currentWidth = width.value * scale.value
        const currentHeight = height.value * scale.value

        const x = (containerWidth.value - currentWidth) / 2
        const y = (containerHeight.value - currentHeight) / 2

        setPosition({ x, y })
    }

    function fit() {
        const paddingX = 80
        const paddingY = 80

        const availableWidth = containerWidth.value - paddingX * 2
        const availableHeight = containerHeight.value - paddingY * 2

        const scaleWidth = availableWidth / width.value
        const scaleHeight = availableHeight / height.value

        const newScale = Math.min(scaleWidth, scaleHeight)

        setScale(newScale)

        centralize()
    }

    return reactive({
        position: readonly(position),
        scale: readonly(scale),

        setPosition,
        setScale,
        fit,
    })
}
