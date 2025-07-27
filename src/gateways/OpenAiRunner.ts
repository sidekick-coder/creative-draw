import type RunnerGateway from '@/contracts/RunnerGateway'
import type { RunPayload } from '@/contracts/RunnerGateway'
import type ThreadImageRepository from '@/contracts/ThreadImageRepository'
import OpenAI from 'openai'

export default class OpenAiRunner implements RunnerGateway {
    public name = 'OpenAI Runner'
    public description = "A runner that uses OpenAI's API to process threads and items."
    public imageRepository: ThreadImageRepository

    public async run(payload: RunPayload) {
        // Implement the logic to interact with OpenAI's API
        // This is a placeholder implementation
        const { thread, items, adapter } = payload

        const key = adapter.config?.apiKey

        if (!key) {
            throw new Error('OpenAI API key is not configured.')
        }

        const client = new OpenAI({
            apiKey: key,
            dangerouslyAllowBrowser: true,
        })

        const content: OpenAI.Responses.ResponseInputContent[] = []

        items.forEach((item, index) => {
            content.push({
                type: 'input_text',
                text: `${index + 1}: ${item.data.content}`,
            })
        })

        const response = await client.responses.create({
            model: 'gpt-4.1-mini',
            tools: [{ type: 'image_generation' }],
            input: [
                {
                    role: 'user',
                    content,
                },
            ],
        })

        const imageData = response.output
            .filter((output) => output.type === 'image_generation_call')
            .map((output) => output.result)

        const base64Image = imageData[0]

        // Simulate processing
        await this.imageRepository.create({
            threadId: thread.id,
            src: base64Image,
            status: 'done',
            metas: {
                openAiResponse: response,
            },
        })
    }

    public async cleanup(): Promise<void> {
        // Optional cleanup logic if needed
    }
}
