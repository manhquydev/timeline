import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables BEFORE importing the service
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Now import the service
import { zaiService } from '../lib/ai/z-ai-service'

async function testZaiVision() {
    console.log('🚀 Testing Zhipu AI Vision Integration...')

    const apiKey = process.env.ZHIPU_AI_API_KEY
    if (!apiKey) {
        console.error('❌ ZHIPU_AI_API_KEY is missing!')
        return
    }
    console.log(`🔑 API Key loaded (starts with: ${apiKey.substring(0, 5)}...)`)

    const testImageUrl = 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=1000'

    try {
        console.log('🧪 Testing Simple Text Chat (GLM-4-Flash)...')
        const textResult = await zaiService.generateSearchFilters('Tìm ảnh đồ ăn đẹp')
        console.log('✅ Text result:', JSON.stringify(textResult, null, 2))

        console.log('\n📸 Testing Image Analysis (GLM-4V-Flash)...')
        console.log(`📸 Analyzing test image: ${testImageUrl}`)
        const result = await zaiService.analyzeImage(testImageUrl)

        console.log('\n✅ AI Analysis Success!')
        console.log('-------------------------')
        console.log(`📝 Description: ${result.description}`)
        console.log(`🏷️ Tags: ${result.tags.join(', ')}`)
        console.log('-------------------------')

        if (result.tags.length > 0) {
            console.log('✨ Vision AI is working correctly!')
        } else {
            console.log('⚠️ AI returned no tags.')
        }
    } catch (error) {
        console.error('❌ AI Analysis Failed:', error)
    }
}

testZaiVision()
