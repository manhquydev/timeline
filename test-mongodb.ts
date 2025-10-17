// Load environment variables FIRST, before any imports
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Now import after env is loaded
import { connectToDatabase, getConnectionStatus } from './lib/mongodb/connection'

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n')
  console.log('MongoDB URI:', process.env.MONGODB_URI ? '✅ Found' : '❌ Missing')

  try {
    console.log('📡 Connecting to MongoDB Atlas...')
    await connectToDatabase()

    const status = getConnectionStatus()
    console.log(`✅ Connection Status: ${status}`)

    console.log('\n🎉 MongoDB connection successful!')
    console.log('✅ Ready to run migration')

    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Connection failed!')
    console.error('Error:', error.message)
    console.error('\nPlease check:')
    console.error('  1. MONGODB_URI is correct in .env.local')
    console.error('  2. Username and password are correct')
    console.error('  3. IP address is whitelisted in MongoDB Atlas')
    console.error('  4. Network connection is working')

    process.exit(1)
  }
}

testConnection()
