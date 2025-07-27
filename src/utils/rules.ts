export const $rules = {
    required() {
        return (value: any) => {
            if (value === null || value === undefined || value === '') {
                return __('Field is required')
            }

            return true
        }
    },
}
