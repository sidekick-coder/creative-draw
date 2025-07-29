import type AdapterRunnerProvider from '@/contracts/AdapterRunnerProvider'
import GptImage1Runner from '@/gateways/GptImage1Runner'
import OpenAI from 'openai'

export default class OpenApiAdapterProvider implements AdapterRunnerProvider {
    public provide: AdapterRunnerProvider['provide'] = async (adapter) => {
        const key = adapter.config?.apiKey

        if (!key) {
            console.log('[open-ai] API key is not configured.')
            return []
        }

        const client = new OpenAI({
            apiKey: key,
            dangerouslyAllowBrowser: true,
        })

        const gptImage = new GptImage1Runner(client, adapter)

        return [gptImage]
    }
}
