import { get } from 'lodash-es'

interface LangMessages {
    [key: string]: string
}

interface Translator {
    locale: string
    messages: Record<string, LangMessages>
}

export const translator: Translator = {
    locale: 'en',
    messages: {
        en: {},
        pt: {},
    },
}

/**
 *
 * @param key The translation key to look up in the messages.
 * @param args
 * @returns string
 * @example
 * $t('New project') // Returns 'New project'
 * $t('New {0}', ['Project']) // Returns 'New Project'
 * $t('Open {name}', {name: 'Document'}) // Returns 'Open Document'
 * @description
 * The $t function is used to translate keys into the current locale's messages.
 * It supports string interpolation for dynamic values.
 * It looks up the key in the translator's messages for the current locale,
 * and replaces placeholders in the message with the provided arguments.
 * If the key is not found, it returns the key itself.
 */
export const $t = (key: string, ...args: string[]): string => {
    const messages = get(translator.messages, translator.locale, {})
    const message = get(messages, key, key)

    if (args.length === 0) {
        return message
    }

    if (typeof message === 'string') {
        return message.replace(/{(\d+)}/g, (match, index) => {
            return typeof args[index] !== 'undefined' ? args[index] : match
        })
    }

    if (typeof message === 'object') {
        return Object.keys(message).reduce((result, placeholder) => {
            return result.replace(new RegExp(`{${placeholder}}`, 'g'), args[0] || '')
        }, message)
    }

    return message
}

// expose $t fn as global __
declare global {
    const __: typeof $t
}

if (typeof window !== 'undefined') {
    ;(window as any).__ = $t
}
