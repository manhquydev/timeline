import OpenAI from 'openai'

/**
 * ZaiService - Handles integration with Zhipu AI (BigModel)
 * Uses OpenAI-compatible SDK for Vision and NLP tasks
 */
export class ZaiService {
    private _client: OpenAI | null = null

    private get client(): OpenAI {
        if (this._client) return this._client

        const apiKey = process.env.ZHIPU_AI_API_KEY
        if (!apiKey) {
            console.error('❌ ZHIPU_AI_API_KEY is not defined in environment variables')
            throw new Error('ZHIPU_AI_API_KEY missing')
        }

        this._client = new OpenAI({
            apiKey: apiKey,
            baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
        })

        return this._client
    }

    constructor() {
        // No initialization here to avoid race conditions with dotenv
    }

    /**
     * Analyze an image using GLM-4V (Vision model)
     * Returns tags and a descriptive caption
     */
    async analyzeImage(imageUrl: string): Promise<{ tags: string[]; description: string; raw?: any }> {
        try {
            const response = await this.client.chat.completions.create({
                model: "glm-4v-flash", // Reverted to Flash for cost-efficiency. If you have balance, you can change this to "glm-4.6" or "glm-4.7"
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Hãy phân tích hình ảnh này và trả về: 1. Một mô tả ngắn gọn (dưới 30 từ). 2. Danh sách các từ khóa (tags) liên quan, phân tách bằng dấu phẩy. Định dạng trả về: Description: [mô tả] | Tags: [tag1, tag2, ...]',
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageUrl,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 500,
            })

            const content = response.choices[0]?.message?.content || ''
            const [descPart, tagsPart] = content.split('|')

            const description = descPart?.replace('Description:', '').trim() || ''
            const tags = tagsPart
                ?.replace('Tags:', '')
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t.length > 0) || []

            return {
                description,
                tags,
                raw: response,
            }
        } catch (error) {
            console.error('ZaiService.analyzeImage Error:', error)
            throw error
        }
    }

    /**
     * Translate natural language queries into MongoDB filter objects
     */
    async generateSearchFilters(query: string): Promise<any> {
        try {
            const response = await this.client.chat.completions.create({
                model: 'glm-4', // Latest text model
                messages: [
                    {
                        role: 'system',
                        content: `Bạn là một trợ lý AI giúp chuyển đổi câu hỏi tự nhiên sang MongoDB query filter cho model Post.
            Schema Post có các trường:
            - ai_tags: string[] (mảng các tag)
            - ai_description: string (mô tả nội dung)
            - wish_text: string (lời chúc của người đăng)
            - user_name: string (tên người đăng)
            - media_type: 'image' | 'video'
            
            Hãy trả về một JSON object duy nhất hợp lệ cho MongoDB filter.
            Ví dụ: "ảnh có bánh kem" -> {"ai_tags": {"$in": ["bánh kem"]}}
            Ví dụ: "ảnh của Tuấn" -> {"user_name": {"$regex": "Tuấn", "$options": "i"}}
            
            Nếu không tìm thấy tiêu chí phù hợp, trả về {}.
            Chỉ trả về JSON, không giải thích gì thêm.`,
                    },
                    {
                        role: 'user',
                        content: query,
                    },
                ],
                response_format: { type: 'json_object' },
            })

            const result = JSON.parse(response.choices[0]?.message?.content || '{}')
            return result
        } catch (error) {
            console.error('ZaiService.generateSearchFilters Error:', error)
            return {}
        }
    }
}

export const zaiService = new ZaiService()
