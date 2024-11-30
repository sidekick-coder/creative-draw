export const $number = {
    percentage: (value: number) => {
        return Intl.NumberFormat('en-US', { style: 'percent' }).format(value)
    },
    pad: (value: number, length = 2) => {
        return ('0'.repeat(length) + value).slice(-length)
    },
}
