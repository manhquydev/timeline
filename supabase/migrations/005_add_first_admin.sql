-- ============================================
-- HƯỚNG DẪN THÊM ADMIN ĐẦU TIÊN
-- ============================================
--
-- Sau khi chạy migration 004_create_user_roles.sql,
-- sử dụng file này để thêm admin đầu tiên cho hệ thống.
--
-- CÁCH 1: Thêm admin bằng email
-- Thay 'your-email@company.com' bằng email admin của bạn
-- ============================================

-- Kiểm tra user đã tồn tại trong auth.users chưa
SELECT id, email, created_at
FROM auth.users
WHERE email = 'your-email@company.com';

-- Nếu user đã có, thêm role admin
INSERT INTO user_roles (user_id, role, created_by)
SELECT id, 'admin', id
FROM auth.users
WHERE email = 'your-email@company.com'
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin', updated_at = NOW();

-- ============================================
-- CÁCH 2: Thêm admin bằng user_id (nếu biết ID)
-- Thay 'user-uuid-here' bằng UUID của user
-- ============================================

-- INSERT INTO user_roles (user_id, role)
-- VALUES ('user-uuid-here', 'admin')
-- ON CONFLICT (user_id)
-- DO UPDATE SET role = 'admin', updated_at = NOW();

-- ============================================
-- CÁCH 3: Thêm nhiều admin cùng lúc
-- ============================================

-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email IN (
--   'admin1@company.com',
--   'admin2@company.com',
--   'admin3@company.com'
-- )
-- ON CONFLICT (user_id)
-- DO UPDATE SET role = 'admin', updated_at = NOW();

-- ============================================
-- KIỂM TRA ADMIN ĐÃ ĐƯỢC TẠO
-- ============================================

SELECT
  ur.role,
  u.email,
  ur.created_at,
  ur.updated_at
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role IN ('admin', 'super_admin')
ORDER BY ur.created_at DESC;

-- ============================================
-- XÓA ADMIN (NẾU CẦN)
-- ============================================

-- DELETE FROM user_roles
-- WHERE user_id IN (
--   SELECT id FROM auth.users WHERE email = 'user-to-remove@company.com'
-- );

-- Hoặc hạ cấp xuống user thông thường
-- UPDATE user_roles
-- SET role = 'user', updated_at = NOW()
-- WHERE user_id IN (
--   SELECT id FROM auth.users WHERE email = 'user-to-demote@company.com'
-- );
