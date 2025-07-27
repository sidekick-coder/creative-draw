import { format } from 'date-fns'

export const $date = {
    format: (date: Date | string, pattern: string): string => {
        return format(date, pattern)
    },
    date(date: Date | string): string {
        return $date.format(date, 'dd/MM/yyyy')
    },
    dateTime(date: Date | string): string {
        return $date.format(date, 'dd/MM/yyyy HH:mm')
    },
}
