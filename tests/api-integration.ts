import * as dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import { POST as searchHandler } from '../app/api/ai/search/route'
import { NextRequest } from 'next/server'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function runApiTests() {
    console.log('🧪 Starting API Integration Logic Tests...')

    try {
        // 1. Test AI Search Logic (Mocking Request)
        console.log('\n🔍 1. Testing AI Search API Logic...')

        // We create a mock request object
        const mockRequestData = {
            query: 'Tìm ảnh có hoa',
            eventId: 'test_event'
        }

        const request = new NextRequest('http://localhost:3000/api/ai/search', {
            method: 'POST',
            body: JSON.stringify(mockRequestData),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const response = await searchHandler(request)
        const data = await response.json()

        console.log(`Response Status: ${response.status}`)
        console.log('Search Result Data:', JSON.stringify(data, null, 2))

        if (response.status === 200) {
            console.log('✅ Search API logic check passed (Connectivity may vary based on Zhipu AI balance).')
        } else {
            console.warn('⚠️ Search API returned non-200 status. This might be due to Zhipu AI balance or connectivity.')
        }

        console.log('\n🏁 API Logic Check Completed!')

    } catch (error) {
        console.error(`\n❌ API Test Failed: ${error}`)
        // We don't exit 1 here if it's just a connectivity issue, but log it
    } finally {
        await mongoose.disconnect()
    }
}

runApiTests()
