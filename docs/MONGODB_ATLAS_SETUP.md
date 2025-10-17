# 🔧 MongoDB Atlas Setup Guide

## ⚠️ Lỗi "bad auth: Authentication failed"

Nếu bạn gặp lỗi này, có nghĩa là:
1. Database user chưa được tạo
2. Username/password không đúng
3. IP address chưa được whitelist

---

## 📋 Các Bước Setup MongoDB Atlas

### Bước 1: Tạo Database User

1. Đăng nhập vào [MongoDB Atlas](https://cloud.mongodb.com)
2. Chọn cluster của bạn
3. Vào **Database Access** (menu bên trái)
4. Click **"Add New Database User"**
5. Chọn **Password** authentication
6. Điền thông tin:
   - **Username**: `manhquydev_db_user`
   - **Password**: `XklSJEvVJbFtzhMZ`
   - **Database User Privileges**: Select **"Read and write to any database"**
7. Click **"Add User"**

### Bước 2: Whitelist IP Address

1. Vào **Network Access** (menu bên trái)
2. Click **"Add IP Address"**
3. Có 2 options:
   - **Option A (Recommended for Development)**:
     - Click "Allow Access from Anywhere"
     - IP: `0.0.0.0/0`
   - **Option B (More Secure)**:
     - Add your specific IP address
     - Get your IP: https://whatismyipaddress.com/
4. Click **"Confirm"**

### Bước 3: Get Connection String

1. Vào **Database** (menu bên trái)
2. Click **"Connect"** trên cluster của bạn
3. Chọn **"Connect your application"**
4. Chọn:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
5. Copy connection string
6. Replace `<password>` với password thực tế

**Your Connection String:**
```
mongodb+srv://manhquydev_db_user:XklSJEvVJbFtzhMZ@cluster0.pojfnts.mongodb.net/timeline?retryWrites=true&w=majority
```

### Bước 4: Verify Database Name

Đảm bảo database name là `timeline`:
1. Vào **Database** → **Browse Collections**
2. Nếu chưa có database `timeline`, nó sẽ tự động được tạo khi chạy migration

---

## ✅ Test Connection

Sau khi setup xong, test connection:

```bash
npx tsx test-mongodb.ts
```

**Expected output:**
```
✅ MongoDB connected successfully
✅ Connection Status: connected
🎉 MongoDB connection successful!
```

---

## 🐛 Troubleshooting

### Lỗi: "bad auth: Authentication failed"

**Nguyên nhân**: Username hoặc password sai

**Giải pháp**:
1. Kiểm tra lại username/password trong MongoDB Atlas
2. Đảm bảo không có space thừa
3. Password có thể cần URL encode nếu có ký tự đặc biệt

### Lỗi: "connection timeout"

**Nguyên nhân**: IP chưa được whitelist

**Giải pháp**:
1. Vào Network Access
2. Whitelist `0.0.0.0/0` (allow all)
3. Đợi 1-2 phút để apply

### Lỗi: "Server selection timed out"

**Nguyên nhân**: Cluster name sai hoặc cluster đang paused

**Giải pháp**:
1. Kiểm tra cluster name: `cluster0.pojfnts.mongodb.net`
2. Đảm bảo cluster đang running (không bị paused)
3. Check connection string format

---

## 📝 Checklist

- [ ] Database user `manhquydev_db_user` đã được tạo
- [ ] Password `XklSJEvVJbFtzhMZ` đã đúng
- [ ] Database user có quyền "Read and write to any database"
- [ ] IP address đã được whitelist (0.0.0.0/0)
- [ ] Cluster đang running (không paused)
- [ ] Connection string trong `.env.local` đã đúng
- [ ] Test connection thành công

---

## 🚀 Next Steps

Sau khi connection thành công:

1. ✅ Run migration:
   ```bash
   npm run migrate
   ```

2. ✅ Verify data:
   ```bash
   npm run verify-migration
   ```

3. ✅ Start development:
   ```bash
   npm run dev
   ```

---

**Need Help?**
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Connection String Format: https://docs.mongodb.com/manual/reference/connection-string/
