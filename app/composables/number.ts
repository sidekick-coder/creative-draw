export const $number = {
    percentage: (value: number) => {
        return Intl.NumberFormat('en-US', { style: 'percent' }).format(value)
    },
}
