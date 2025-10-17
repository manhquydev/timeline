# MongoDB Authentication Troubleshooting Guide

## 🔍 Problem

You're seeing this error when trying to connect to MongoDB:

```
MongoServerError: bad auth : Authentication failed.
```

This guide will help you diagnose and fix MongoDB authentication issues.

---

## 🚀 Quick Fix (Most Common Solution)

**The issue is usually with your MongoDB password or credentials.** Here's how to fix it:

### Step-by-Step Fix:

1. **Go to MongoDB Atlas Console**
   - Visit https://cloud.mongodb.com/
   - Sign in to your account

2. **Navigate to Database Access**
   - Click on "Database Access" in the left sidebar
   - Find your database user (e.g., `manhquydev_db_user`)

3. **Reset Password**
   - Click "Edit" next to your user
   - Click "Edit Password"
   - Generate a new password (recommended: use **alphanumeric only**, no special characters)
   - Copy the new password
   - Click **"Update User"** (IMPORTANT: Don't forget this step!)

4. **Wait for Deployment**
   - Wait 1-2 minutes for the password change to deploy across MongoDB Atlas

5. **Update .env.local**
   - Open your `.env.local` file
   - Update the `MONGODB_URI` with the new password:
   ```
   MONGODB_URI="mongodb+srv://username:NEW_PASSWORD@cluster0.xxxxx.mongodb.net/database"
   ```

6. **Test Connection**
   ```bash
   npm run test:mongodb
   ```

If you see "✅ MongoDB connection successful!" - you're done!

---

## 🛠️ Diagnostic Tool

We've created a diagnostic tool to help identify authentication issues:

```bash
npm run fix:mongodb-auth
```

This will:
- Check your MongoDB URI format
- Detect special characters in password that need encoding
- Provide specific recommendations for your setup
- List all common causes and solutions

---

## 📋 Common Causes & Solutions

### 1. Wrong Password Type ❌

**Problem:** Using your MongoDB account password instead of database user password

**Solution:**
- MongoDB Atlas has TWO different passwords:
  - **Account password** - for logging into MongoDB Atlas website
  - **Database user password** - for connecting to the database (THIS is what you need)
- Reset your database user password as described in Quick Fix above

---

### 2. Special Characters in Password ⚠️

**Problem:** Passwords with special characters need URL encoding

**Special characters that need encoding:**
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `^` → `%5E`
- `&` → `%26`
- And others...

**Solution A (Recommended):** Create a new user with alphanumeric-only password
```bash
npm run fix:mongodb-auth
```
Follow the instructions to reset with a simple password

**Solution B:** URL encode your password
```javascript
// If your password is: MyP@ss#123
// Use: MyP%40ss%23123
```

---

### 3. IP Address Not Whitelisted 🌐

**Problem:** Your IP address is not allowed to connect to MongoDB Atlas

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Options:
   - **For Development:** Add `0.0.0.0/0` to allow access from anywhere
   - **For Production:** Add your specific IP address

---

### 4. Forgot to Click "Update User" 🔘

**Problem:** Changed password but didn't save changes

**Solution:**
- After editing password in MongoDB Atlas, ALWAYS click **"Update User"**
- Wait 1-2 minutes for changes to deploy

---

### 5. Database User Permissions ⚙️

**Problem:** User doesn't have correct permissions

**Solution:**
1. Go to MongoDB Atlas → Database Access
2. Edit your user
3. Ensure user has **"Read and write to any database"** role
4. Click "Update User"

---

### 6. Connection String Format 📝

**Problem:** Invalid MongoDB URI format

**Correct Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?retryWrites=true&w=majority
```

**Check:**
- Protocol: `mongodb+srv://` (note the `+srv`)
- Username: Your database username
- Password: Your database user password (URL encoded if has special chars)
- Host: Your cluster hostname
- Database: Your database name
- Auth source: Usually `admin` (default for Atlas)

---

## 🧪 Testing Your Connection

After making changes, test your connection:

```bash
# Test MongoDB connection
npm run test:mongodb

# Run diagnostic tool
npm run fix:mongodb-auth
```

---

## 🔧 Advanced Troubleshooting

### Check MongoDB URI is Loaded

```bash
# On Windows (PowerShell)
$env:MONGODB_URI

# On macOS/Linux
echo $MONGODB_URI
```

### Connection String with Auth Source

If you need to explicitly specify auth source:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?authSource=admin&retryWrites=true&w=majority
```

### Verify User Exists

1. Go to MongoDB Atlas
2. Click Database Access
3. Verify your user exists and is enabled (not disabled)

---

## 📞 Still Having Issues?

If you've tried all the above and still getting authentication errors:

1. **Delete and recreate the database user:**
   - Go to Database Access
   - Delete the current user
   - Create a new user with a simple alphanumeric password
   - Update `.env.local` with new credentials

2. **Check MongoDB Atlas Status:**
   - Visit https://status.mongodb.com/
   - Ensure there are no ongoing incidents

3. **Verify your cluster is running:**
   - Go to Database → Browse Collections
   - Ensure your cluster is active (not paused)

4. **Create a test with MongoDB Atlas UI:**
   - Use "Connect" button in Atlas
   - Try "Connect with MongoDB Compass" to verify credentials work
   - If Compass can't connect, the issue is definitely with credentials

---

## ✅ Success Checklist

- [ ] Reset database user password in MongoDB Atlas
- [ ] Clicked "Update User" after password change
- [ ] Waited 1-2 minutes for deployment
- [ ] Updated `MONGODB_URI` in `.env.local`
- [ ] Password is alphanumeric only OR properly URL encoded
- [ ] IP address is whitelisted in Network Access
- [ ] User has correct permissions (Read and write to any database)
- [ ] Ran `npm run test:mongodb` successfully

---

## 🎓 Understanding the Error

The "bad auth : Authentication failed" error from MongoDB means:

> The username/password combination you provided is not valid for the database you're trying to access.

This is a **security feature** - MongoDB won't tell you specifically what's wrong (username vs password) to prevent attackers from learning about your system.

**Most common causes (in order):**
1. Wrong password (90% of cases)
2. Special characters not URL encoded (5%)
3. IP not whitelisted (3%)
4. Other configuration issues (2%)

---

## 🔗 Useful Links

- [MongoDB Atlas Console](https://cloud.mongodb.com/)
- [MongoDB Connection String Docs](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [MongoDB Atlas Network Access](https://www.mongodb.com/docs/atlas/security/ip-access-list/)
- [URL Encoding Reference](https://www.w3schools.com/tags/ref_urlencode.ASP)

---

**Last Updated:** 2025-10-16
