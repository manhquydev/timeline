// MongoDB Authentication Troubleshooting Script
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

function parseMongoURI(uri: string) {
  try {
    const url = new URL(uri)

    return {
      protocol: url.protocol,
      username: url.username,
      password: url.password,
      host: url.hostname,
      database: url.pathname.slice(1).split('?')[0],
      params: Object.fromEntries(url.searchParams),
    }
  } catch (error) {
    return null
  }
}

function checkPasswordSpecialChars(password: string): string[] {
  const specialChars = ['@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '[', ']', '{', '}', '|', '\\', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/']
  const found: string[] = []

  for (const char of specialChars) {
    if (password.includes(char)) {
      found.push(char)
    }
  }

  return found
}

function urlEncodePassword(password: string): string {
  return encodeURIComponent(password)
}

async function diagnose() {
  console.log('🔍 MongoDB Authentication Diagnostic Tool\n')
  console.log('━'.repeat(60))

  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.log('❌ MONGODB_URI not found in .env.local')
    console.log('\n📝 Solution:')
    console.log('   Add MONGODB_URI to your .env.local file')
    return
  }

  console.log('✅ MONGODB_URI found\n')

  const parsed = parseMongoURI(uri)

  if (!parsed) {
    console.log('❌ Invalid MongoDB URI format')
    console.log('\n📝 Expected format:')
    console.log('   mongodb+srv://username:password@host/database?options')
    return
  }

  console.log('📊 Connection Details:')
  console.log(`   Protocol: ${parsed.protocol}`)
  console.log(`   Username: ${parsed.username}`)
  console.log(`   Password: ${'*'.repeat(parsed.password.length)}`)
  console.log(`   Host: ${parsed.host}`)
  console.log(`   Database: ${parsed.database}`)
  console.log(`   Auth Source: ${parsed.params.authSource || 'admin (default)'}`)

  console.log('\n━'.repeat(60))
  console.log('\n🔎 Diagnostic Results:\n')

  let issuesFound = false

  // Check 1: Special characters in password
  const specialChars = checkPasswordSpecialChars(parsed.password)
  if (specialChars.length > 0) {
    issuesFound = true
    console.log('⚠️  Issue #1: Special characters detected in password')
    console.log(`   Found characters: ${specialChars.join(', ')}`)
    console.log('   These characters may need URL encoding')
    console.log('\n   🔧 Fix:')
    console.log('   Option A: URL encode your password')
    const encoded = urlEncodePassword(parsed.password)
    console.log(`   Current password: ${parsed.password}`)
    console.log(`   Encoded password: ${encoded}`)
    console.log('\n   Option B: Create a new MongoDB user with alphanumeric-only password')
    console.log('   (Recommended for simplicity)')
    console.log()
  }

  // Check 2: Auth source
  if (!parsed.params.authSource) {
    console.log('ℹ️  Info: No authSource specified (using default: admin)')
    console.log('   This is usually correct for MongoDB Atlas')
    console.log()
  }

  // Check 3: Common issues
  console.log('📋 Common Causes of "bad auth" Error:\n')
  console.log('   1️⃣  Using account password instead of database user password')
  console.log('      → Go to MongoDB Atlas > Database Access > Edit User > Reset Password')
  console.log()
  console.log('   2️⃣  Password not deployed yet (after reset)')
  console.log('      → Wait 1-2 minutes after password reset')
  console.log()
  console.log('   3️⃣  IP address not whitelisted')
  console.log('      → Go to MongoDB Atlas > Network Access > Add IP Address')
  console.log('      → Use 0.0.0.0/0 to allow access from anywhere (for testing)')
  console.log()
  console.log('   4️⃣  Database user doesn\'t have correct permissions')
  console.log('      → Go to MongoDB Atlas > Database Access')
  console.log('      → Ensure user has "Read and write to any database" role')
  console.log()
  console.log('   5️⃣  Forgot to click "Update User" after changing password')
  console.log('      → Always click "Update User" after making changes')
  console.log()

  console.log('━'.repeat(60))
  console.log('\n💡 Recommended Steps:\n')
  console.log('   Step 1: Go to https://cloud.mongodb.com/')
  console.log('   Step 2: Navigate to Database Access')
  console.log('   Step 3: Find your user and click "Edit"')
  console.log('   Step 4: Click "Edit Password"')
  console.log('   Step 5: Generate a new password (alphanumeric only)')
  console.log('   Step 6: Click "Update User" (IMPORTANT!)')
  console.log('   Step 7: Wait 1-2 minutes for deployment')
  console.log('   Step 8: Update MONGODB_URI in .env.local with new password')
  console.log('   Step 9: Run "npm run test:mongodb" to verify')
  console.log()

  if (issuesFound) {
    console.log('⚠️  Issues detected. Please review and fix above.')
  } else {
    console.log('✅ No obvious issues detected.')
    console.log('   If you\'re still getting authentication errors,')
    console.log('   follow the recommended steps above to reset your password.')
  }

  console.log('\n━'.repeat(60))
}

diagnose().catch(console.error)
